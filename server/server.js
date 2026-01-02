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
const webPushConfig = require('./webPush'); 
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

        for (const event of events) {
            if (event.price === 0) {
                await Ticket.deleteMany({ event: event._id });
                await Event.findByIdAndDelete(event._id);
            } else {
                await Ticket.updateMany({ event: event._id }, { $set: { status: 'archived' } });
                event.status = 'archived';
                await event.save();
            }
            await Notification.deleteMany({ relatedEvent: event._id });
        }
    } catch (error) {
        console.error("❌ Auto-cleanup error:", error);
    }
};

cleanupExpiredEvents();
setInterval(cleanupExpiredEvents, 3600000);

// --- AUTH ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, role, surname, description, socialLinks } = req.body;
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) return res.status(400).json({ error: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const isVerified = (role === 'studente');

        const newUser = await User.create({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            name, role, surname, description, socialLinks, isVerified,
            favorites: [], followedAssociations: [], followersCount: 0
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
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || user.isDeleted) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.userId).populate('followedAssociations', 'name profileImage');
    res.json(user);
});

// --- REPORTS (UGC) ---

app.post('/api/reports', authMiddleware, async (req, res) => {
    try {
        const { eventId, reason } = req.body;
        if (!eventId || !reason) return res.status(400).json({ error: "Missing data" });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ error: "Event not found" });

        const report = await Report.create({
            eventId,
            reporterId: req.user.userId,
            reason
        });

        // Notify Admins
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await Notification.create({
                recipient: admin._id,
                title: `Segnalazione Evento`,
                message: `L'evento "${event.title}" è stato segnalato. Motivo: ${reason}`,
                url: `/admin?tab=reports`,
                type: 'report'
            });
        }

        res.json(report);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/reports', authMiddleware, adminMiddleware, async (req, res) => {
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

        // Notify Organization
        await Notification.create({
            recipient: event.organization,
            title: `Evento rimosso`,
            message: `Il tuo evento "${event.title}" è stato rimosso dalla moderazione. Motivo: ${reason}`,
            url: `/dashboard`,
            type: 'info'
        });

        // Resolve Reports
        await Report.updateMany({ eventId: req.params.id, status: 'pending' }, { $set: { status: 'resolved' } });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/reports/:id/dismiss', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Report.findByIdAndUpdate(req.params.id, { status: 'dismissed' });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
});

app.get('/api/admin/events', authMiddleware, adminMiddleware, async (req, res) => {
    const events = await Event.find({}).populate('organization', 'name email').sort({ date: -1 });
    res.json(events);
});

app.put('/api/admin/users/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isVerified = !user.isVerified; 
    await user.save();
    res.json(user);
});

// --- Standard Event Routes ---
app.get('/api/events', async (req, res) => {
    try {
        const { organization, public: isPublic } = req.query;
        let query = {};
        if (organization) {
            query.organization = organization;
            query.status = isPublic === 'true' ? 'active' : { $in: ['active', 'archived', 'draft'] };
        } else {
            query.status = 'active';
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
    const event = await Event.findById(req.params.id).populate('organization', 'name _id email');
    res.json(event);
});

app.post('/api/events', authMiddleware, async (req, res) => {
    if (req.user.role !== 'associazione') return res.status(403).json({ error: "Only associations can create events" });
    const user = await User.findById(req.user.userId);
    if (!user.isVerified) return res.status(403).json({ error: "Account not verified." });
    
    const newEvent = await Event.create({
        ...req.body,
        organization: req.user.userId,
        stripeAccountId: user.stripeAccountId
    });
    res.json(newEvent);
});

// --- TICKETS ---
app.get('/api/tickets', authMiddleware, async (req, res) => {
    const tickets = await Ticket.find({ owner: req.user.userId, status: { $ne: 'deleted' } }).populate('event');
    res.json(tickets);
});

app.post('/api/tickets/validate', authMiddleware, async (req, res) => {
    const { qrCodeId } = req.body;
    const ticket = await Ticket.findOne({ qrCodeId }).populate('event');
    if (!ticket) return res.status(404).json({ error: "INVALID_TICKET" });
    
    ticket.status = 'completed';
    ticket.used = true;
    await ticket.save();
    res.json(ticket);
});

app.get('/api/notifications', authMiddleware, async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user.userId }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
});

app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.sendStatus(200);
});

app.get('/api/notifications/vapid-key', (req, res) => {
    res.json({ key: webPushConfig.publicVapidKey });
});

app.post('/api/stripe/connect', authMiddleware, StripeController.createConnectAccount);
app.post('/api/stripe/create-checkout-session', authMiddleware, StripeController.createCheckoutSession);
app.post('/api/stripe/verify', authMiddleware, StripeController.verifyPayment);

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist', 'index.html')));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));