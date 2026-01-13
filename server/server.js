require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const StripeController = require('./stripe');
const { User, Event, Ticket, Order, Notification, Report } = require('./models');
const { authMiddleware, adminMiddleware } = require('./middleware');
const mailer = require('./mailer');
const notificationService = require('./webPush'); 
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.post('/api/webhook', express.raw({type: 'application/json'}), StripeController.handleWebhook);

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const cleanupExpiredEvents = async () => {
    try {
        console.log("🧹 Running Smart Deletion Cleanup...");
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        fiveDaysAgo.setHours(0, 0, 0, 0);

        const events = await Event.find({
            date: { $lt: fiveDaysAgo },
            $or: [
                { status: 'active' },
                { status: { $exists: false } }
            ]
        });

        let hardDeletedCount = 0;
        let archivedCount = 0;

        for (const event of events) {
            if (event.price === 0) {
                await Ticket.deleteMany({ event: event._id });
                await Event.findByIdAndDelete(event._id);
                hardDeletedCount++;
            } 
            else {
                await Ticket.updateMany(
                    { event: event._id },
                    { $set: { status: 'archived' } }
                );
                event.status = 'archived';
                await event.save();
                archivedCount++;
            }
            await Notification.deleteMany({ relatedEvent: event._id });
        }
        
        if (hardDeletedCount > 0 || archivedCount > 0) {
            console.log(`✅ Smart Cleanup Complete: ${hardDeletedCount} Hard Deleted (Free), ${archivedCount} Archived (Paid).`);
        }
    } catch (error) {
        console.error("❌ Auto-cleanup error:", error);
    }
};

cleanupExpiredEvents();
setInterval(cleanupExpiredEvents, 3600000);

// ==========================================
// ROUTES
// ==========================================

// Register Device for OneSignal Notifications (App Only)
app.post('/api/notifications/register-device', authMiddleware, async (req, res) => {
    try {
        const { playerId } = req.body;
        if (!playerId) return res.status(400).json({ error: "Missing playerId" });

        await User.findByIdAndUpdate(req.user.userId, { oneSignalPlayerId: playerId });
        res.json({ success: true, message: "Device registered for notifications" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, role, surname, description, socialLinks } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const escapedEmail = escapeRegex(email.trim());
        const existing = await User.findOne({ 
            email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } 
        });

        if (existing) return res.status(400).json({ error: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const isVerified = (role === 'studente');

        const newUser = await User.create({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            name,
            role,
            surname,
            description,
            socialLinks,
            isVerified,
            favorites: [],
            followedAssociations: [],
            followersCount: 0
        });

        const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        await mailer.sendWelcomeEmail(newUser.email, name);
        res.json({ token, user: newUser });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

        const escapedEmail = escapeRegex(email.trim());
        const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } 
        });

        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        if (user.isDeleted) return res.status(403).json({ error: "Account cancellato o sospeso." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ 
          userId: user._id, 
          role: user.role, 
          parentOrganization: user.parentOrganization 
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.json({ message: "Se l'email esiste, riceverai un link di recupero." });
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        await mailer.sendPasswordResetEmail(user.email, token);
        res.json({ message: "Se l'email esiste, riceverai un link di recupero." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: "Missing data" });
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ error: "Token non valido o scaduto" });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: "Password aggiornata con successo" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.userId).populate('followedAssociations', 'name profileImage');
    if (!user || user.isDeleted) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

app.post('/api/auth/staff-account', authMiddleware, async (req, res) => {
    if (req.user.role !== 'associazione') return res.status(403).json({ error: "Solo le associazioni possono gestire lo staff" });
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email e Password richieste" });
        const escapedEmail = escapeRegex(email.trim());
        let staffUser = await User.findOne({ 
            email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } 
        });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        if (staffUser) {
            if (staffUser.role !== 'staff' || staffUser.parentOrganization.toString() !== req.user.userId) {
                return res.status(403).json({ error: "Questa email è già associata a un altro account non gestibile da te." });
            }
            staffUser.password = hashedPassword;
            await staffUser.save();
            return res.json({ message: "Account Staff aggiornato", user: staffUser });
        } else {
            const newStaff = await User.create({
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                name: `Staff - ${req.user.userId.slice(-4)}`,
                role: 'staff',
                parentOrganization: req.user.userId,
                isVerified: true
            });
            return res.json({ message: "Account Staff creato", user: newStaff });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/auth/staff-accounts', authMiddleware, async (req, res) => {
    if (req.user.role !== 'associazione') return res.status(403).json({ error: "Accesso negato" });
    try {
        const staff = await User.find({ role: 'staff', parentOrganization: req.user.userId }).select('email name createdAt');
        res.json(staff);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/auth/staff-accounts/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'associazione') return res.status(403).json({ error: "Accesso negato" });
    try {
        const result = await User.findOneAndDelete({ _id: req.params.id, parentOrganization: req.user.userId, role: 'staff' });
        if (!result) return res.status(404).json({ error: "Staff account non trovato o non autorizzato" });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/users/:id', authMiddleware, async (req, res) => {
    if (req.user.userId !== req.params.id) return res.status(403).json({ error: "Unauthorized" });
    if (req.body.email) req.body.email = req.body.email.toLowerCase().trim();
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('followedAssociations', 'name profileImage');
    res.json(updated);
});

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
    if (req.user.userId !== req.params.id) return res.status(403).json({ error: "Unauthorized" });
    try {
        const hasPaidOrders = await Order.exists({ userId: req.params.id, status: 'completed', totalAmountCents: { $gt: 0 } });
        const hasSoldPaidEvents = await Event.exists({ organization: req.params.id, price: { $gt: 0 }, ticketsSold: { $gt: 0 } });
        const mustRetainData = hasPaidOrders || hasSoldPaidEvents;
        if (mustRetainData) {
            await User.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() });
            return res.json({ success: true, message: "Account disattivato. I dati fiscali verranno conservati per i termini di legge." });
        } else {
            await Ticket.deleteMany({ owner: req.params.id });
            await Event.deleteMany({ organization: req.params.id });
            await User.findByIdAndDelete(req.params.id);
            return res.json({ success: true, message: "Account e tutti i dati associati cancellati definitivamente." });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/users/favorites/toggle', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.body;
        const user = await User.findById(req.user.userId);
        const index = user.favorites.findIndex(fav => fav.toString() === eventId);
        if (index === -1) {
            user.favorites.push(eventId);
            await Event.findByIdAndUpdate(eventId, { $inc: { favoritesCount: 1 } });
        } else {
            user.favorites.splice(index, 1);
            await Event.findByIdAndUpdate(eventId, { $inc: { favoritesCount: -1 } });
        }
        await user.save();
        res.json(user.favorites);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/users/favorites/list', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate({
            path: 'favorites',
            populate: { path: 'organization', select: 'name _id' }
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        const now = new Date();
        const visibilityCutoff = new Date();
        visibilityCutoff.setHours(0, 0, 0, 0); 
        if (now.getHours() < 10) visibilityCutoff.setDate(visibilityCutoff.getDate() - 1);
        const filteredFavorites = (user.favorites || []).filter(event => {
            if (!event) return false;
            const isActive = event.status === 'active' || !event.status;
            const isVisible = new Date(event.date) >= visibilityCutoff;
            return isActive && isVisible;
        });
        res.json(filteredFavorites);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/reports', authMiddleware, async (req, res) => {
    try {
        const { eventId, reason } = req.body;
        if (!eventId || !reason) return res.status(400).json({ error: "Missing data" });
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: "Event not found" });
        const report = await Report.create({ eventId, reporterId: req.user.userId, reason });
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await Notification.create({
                recipient: admin._id,
                title: `Nuova segnalazione`,
                message: `L'evento "${event.title}" è stato segnalato. Motivo: ${reason}`,
                url: `/admin?tab=reports`,
            });
        }
        res.json(report);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/reports', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const reports = await Report.find({ status: 'pending' })
            .populate('eventId', 'title organization image')
            .populate('reporterId', 'name email')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/events/:id/delete-with-reason', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { reason } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });
        event.status = 'deleted';
        await event.save();
        await Notification.create({
            recipient: event.organization,
            title: `Evento rimosso`,
            message: `Il tuo evento "${event.title}" è stato rimosso dalla moderazione. Motivo: ${reason}`,
            url: `/dashboard`,
        });
        await Report.updateMany({ eventId: req.params.id, status: 'pending' }, { $set: { status: 'resolved' } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const visibilityCutoff = new Date();
    visibilityCutoff.setHours(0, 0, 0, 0);
    if (now.getHours() < 10) visibilityCutoff.setDate(visibilityCutoff.getDate() - 1);
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate('relatedEvent', 'date')
      .sort({ createdAt: -1 });
    const validNotifications = notifications.filter(n => {
       if (!n.relatedEvent) return true;
       return new Date(n.relatedEvent.date) >= visibilityCutoff;
    });
    res.json(validNotifications.slice(0, 20));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.userId });
        if (notification) {
            notification.isRead = true;
            await notification.save();
        }
        res.json(notification);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/users/follow/toggle', authMiddleware, async (req, res) => {
    try {
        const { associationId } = req.body;
        const student = await User.findById(req.user.userId);
        const association = await User.findById(associationId);
        if (!association || association.role !== 'associazione') return res.status(404).json({ error: "Association not found" });
        const isFollowing = student.followedAssociations.includes(associationId);
        if (isFollowing) {
            student.followedAssociations = student.followedAssociations.filter(id => id.toString() !== associationId);
            association.followersCount = Math.max(0, (association.followersCount || 0) - 1);
        } else {
            student.followedAssociations.push(associationId);
            association.followersCount = (association.followersCount || 0) + 1;
        }
        await student.save();
        await association.save();
        const updatedStudent = await User.findById(req.user.userId).populate('followedAssociations', 'name profileImage');
        res.json(updatedStudent.followedAssociations);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/users/search', authMiddleware, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const associations = await User.find({
            role: 'associazione',
            isDeleted: { $ne: true }, 
            name: { $regex: q, $options: 'i' }
        }).select('name profileImage followersCount description');
        res.json(associations);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/users/:id/public', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name profileImage description socialLinks followersCount role isDeleted');
        if (!user || user.isDeleted) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/users/:id/refresh-stripe', authMiddleware, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || !user.stripeAccountId) return res.status(400).json({ error: "No stripe account" });
    user.stripeOnboardingComplete = true;
    await user.save();
    res.json(user);
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/events', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const events = await Event.find({}).populate('organization', 'name email').sort({ date: -1 });
        res.json(events);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/users/:id/tickets', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const tickets = await Ticket.find({ owner: req.params.id }).populate({ path: 'event', select: 'title date' }).sort({ purchaseDate: -1 });
        res.json(tickets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/admin/users/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        user.isVerified = !user.isVerified; 
        await user.save();
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/admin/users/:id/restore', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: false, deletedAt: null }, { new: true });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const { organization, public: isPublic } = req.query;
        let query = {};
        if (organization) {
            query.organization = organization;
            if (isPublic === 'true') {
                 query.$or = [{ status: 'active' }, { status: { $exists: false } }];
                 const now = new Date();
                 const visibilityCutoff = new Date();
                 visibilityCutoff.setHours(0, 0, 0, 0); 
                 if (now.getHours() < 10) visibilityCutoff.setDate(visibilityCutoff.getDate() - 1); 
                 query.date = { $gte: visibilityCutoff };
            } else {
                 query.$or = [{ status: { $in: ['active', 'archived', 'draft'] } }, { status: { $exists: false } }];
            }
        } else {
            query.$or = [{ status: 'active' }, { status: { $exists: false } }];
            const now = new Date();
            const visibilityCutoff = new Date();
            visibilityCutoff.setHours(0, 0, 0, 0); 
            if (now.getHours() < 10) visibilityCutoff.setDate(visibilityCutoff.getDate() - 1); 
            query.date = { $gte: visibilityCutoff };
        }
        const events = await Event.find(query).populate('organization', 'name _id');
        res.json(events);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organization', 'name _id email');
        if (!event) return res.status(404).json({ error: "Not Found" });
        res.json(event);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/events', authMiddleware, async (req, res) => {
    if (req.user.role !== 'associazione') return res.status(403).json({ error: "Only associations can create events" });
    try {
        const user = await User.findById(req.user.userId);
        if (!user.isVerified) return res.status(403).json({ error: "Account not verified." });
        if (req.body.price !== undefined) req.body.price = Number(Number(req.body.price).toFixed(2));
        let { title, description, longDescription, image, date, time, location, city, price, maxCapacity, category, prLists, status, requiresMatricola, requiresCorsoStudi, scanType } = req.body;
        if (price < 0) return res.status(400).json({ error: "Price cannot be negative" });
        if (maxCapacity <= 0) return res.status(400).json({ error: "Max capacity must be > 0" });
        if (!city) return res.status(400).json({ error: "City is required" });
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (inputDate < today) return res.status(400).json({ error: "Event date cannot be in the past" });
        const newEvent = await Event.create({ title, description, longDescription, image, date, time, location, city, price, maxCapacity, category, prLists, organization: req.user.userId, stripeAccountId: user.stripeAccountId, ticketsSold: 0, favoritesCount: 0, status: status || 'active', requiresMatricola: !!requiresMatricola, requiresCorsoStudi: !!requiresCorsoStudi, scanType: scanType || 'entry_only' });
        await newEvent.populate('organization', 'name _id');
        if (newEvent.status === 'active') {
             const followers = await User.find({ followedAssociations: req.user.userId });
             if (followers.length > 0) {
                 const notificationDocs = followers.map(follower => ({
                     recipient: follower._id,
                     title: `Nuovo Evento: ${newEvent.title}`,
                     message: `${user.name} ha pubblicato un nuovo evento!`,
                     url: `/events/${newEvent._id}`,
                     isRead: false,
                     relatedEvent: newEvent._id 
                 }));
                 await Notification.insertMany(notificationDocs);
                 followers.forEach(follower => {
                     if (follower.oneSignalPlayerId) {
                         notificationService.sendPushNotification(follower._id, `Nuovo Evento: ${newEvent.title}`, `${user.name} ha pubblicato un nuovo evento!`, `/events/${newEvent._id}`);
                     }
                 });
             }
        }
        res.json(newEvent);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/events/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: "Not Found" });
        if (event.organization.toString() !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });
        if (req.body.price !== undefined) req.body.price = Number(Number(req.body.price).toFixed(2));
        let { title, description, longDescription, image, date, time, location, city, maxCapacity, category, prLists, price, status, requiresMatricola, requiresCorsoStudi, scanType } = req.body;
        const updated = await Event.findByIdAndUpdate(req.params.id, { title, description, longDescription, image, date, time, location, city, maxCapacity, category, prLists, ...(price !== undefined && { price }), ...(status !== undefined && { status }), ...(requiresMatricola !== undefined && { requiresMatricola }), ...(requiresCorsoStudi !== undefined && { requiresCorsoStudi }), ...(scanType !== undefined && { scanType }) }, { new: true }).populate('organization', 'name _id');
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/events/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: "Not Found" });
        if (event.organization.toString() !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });
        event.status = 'deleted';
        await event.save();
        await Ticket.updateMany({ event: req.params.id }, { $set: { status: 'deleted' } });
        await Notification.deleteMany({ relatedEvent: req.params.id });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/events/:id/stats', authMiddleware, async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: "Event not found" });
        if (event.organization.toString() !== req.user.userId && req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
        const tickets = await Ticket.find({ event: eventId });
        const favoritesRealCount = await User.countDocuments({ favorites: new mongoose.Types.ObjectId(eventId) });
        if (event.favoritesCount !== favoritesRealCount) await Event.findByIdAndUpdate(eventId, { favoritesCount: favoritesRealCount });
        const stats = { favorites: favoritesRealCount };
        tickets.forEach(t => {
            const list = t.prList || "Nessuna lista";
            stats[list] = (stats[list] || 0) + 1;
        });
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/events/:id/attendees', authMiddleware, async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: "Event not found" });
        if (event.organization.toString() !== req.user.userId && req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
        const tickets = await Ticket.find({ event: eventId, status: { $ne: 'deleted' } }).select('ticketHolderName matricola corsoStudi status entryTime exitTime prList purchaseDate').sort({ ticketHolderName: 1 });
        res.json(tickets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const { owner } = req.query;
        if (owner && owner !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });
        const tickets = await Ticket.find({ owner: req.user.userId, $or: [{ status: { $ne: 'deleted' } }, { status: { $exists: false } }] }).populate('event');
        const now = new Date();
        const visibilityCutoff = new Date();
        visibilityCutoff.setHours(0, 0, 0, 0); 
        if (now.getHours() < 10) visibilityCutoff.setDate(visibilityCutoff.getDate() - 1); 
        const visibleTickets = tickets.filter(ticket => {
            if (!ticket.event) return false; 
            const evStatus = ticket.event.status;
            if (evStatus === 'deleted' || evStatus === 'archived') return false; 
            if (evStatus === 'draft') return false;
            const eventDate = new Date(ticket.event.date);
            return eventDate >= visibilityCutoff;
        });
        res.json(visibleTickets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/tickets/validate', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'associazione' && req.user.role !== 'staff') return res.status(403).json({ error: "Unauthorized" });
        const { qrCodeId } = req.body;
        const ticket = await Ticket.findOne({ qrCodeId }).populate('event');
        if (!ticket) return res.status(404).json({ error: "INVALID_TICKET" });
        if (ticket.status === 'deleted') return res.status(400).json({ error: "TICKET_INVALID_DELETED" });
        const orgId = typeof ticket.event.organization === 'object' ? ticket.event.organization._id.toString() : ticket.event.organization.toString();
        const isStaffOfOrg = req.user.role === 'staff' && req.user.parentOrganization?.toString() === orgId;
        if (orgId !== req.user.userId && !isStaffOfOrg) return res.status(403).json({ error: "WRONG_EVENT_ORGANIZER" });
        const event = ticket.event;
        const scanType = event.scanType || 'entry_only';
        let message = "Voucher Valid";
        let action = "check-in";
        if (scanType === 'entry_only') {
             if (ticket.used || ticket.status === 'completed') return res.status(400).json({ error: "ALREADY_USED" });
             ticket.used = true;
             ticket.status = 'completed';
             ticket.checkInDate = new Date();
             ticket.entryTime = new Date(); 
             message = "Ingresso Registrato";
        } else {
            if (ticket.status === 'valid' || ticket.status === 'active' || !ticket.status) {
                ticket.status = 'entered';
                ticket.entryTime = new Date();
                message = "Ingresso Registrato";
                action = "entry";
            } 
            else if (ticket.status === 'entered') {
                ticket.status = 'completed';
                ticket.exitTime = new Date();
                ticket.used = true; 
                message = "Uscita Registrata";
                action = "exit";
            }
            else if (ticket.status === 'completed') return res.status(400).json({ error: "ALREADY_USED" }); 
        }
        await ticket.save();
        const response = ticket.toObject();
        response.scanAction = action; 
        response.scanMessage = message;
        res.json(response);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/stripe/connect', authMiddleware, StripeController.createConnectAccount);
app.post('/api/stripe/create-checkout-session', authMiddleware, StripeController.createCheckoutSession);
app.post('/api/stripe/verify', authMiddleware, StripeController.verifyPayment);

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});