
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StripeController = require('./stripe');
const { User, Event, Ticket, Order } = require('./models');
const { authMiddleware, adminMiddleware } = require('./middleware');
const mailer = require('./mailer'); // Import Mailer
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURATION ---
app.use(cors());

// --- STRIPE WEBHOOK (Must be before express.json) ---
app.post('/api/webhook', express.raw({type: 'application/json'}), StripeController.handleWebhook);

// --- PARSER ---
app.use(express.json());

// --- DATABASE ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// HELPERS
// ==========================================
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// ==========================================
// AUTOMATIC CLEANUP (SMART DELETION - GDPR/FISCAL)
// ==========================================
const cleanupExpiredEvents = async () => {
    try {
        console.log("🧹 Running Smart Deletion Cleanup...");
        
        // Calculate the cutoff date: 5 days ago
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        fiveDaysAgo.setHours(0, 0, 0, 0); // Normalize time

        // Find events older than 5 days that are currently 'active' (or legacy with no status)
        // We ignore already 'archived' or 'deleted' events to avoid redundant processing
        // Drafts are also ignored, they are managed manually by the user
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
            // STRATEGY 1: FREE EVENTS (price === 0) -> HARD DELETE
            // Reason: No transaction occurred, so no fiscal requirement to keep data.
            // Action: Remove completely to minimize GDPR data footprint.
            if (event.price === 0) {
                console.log(`🗑️ Hard Deleting Free Event (GDPR Minimize): ${event.title}`);
                
                // 1. Delete all associated tickets physically
                await Ticket.deleteMany({ event: event._id });
                
                // 2. Delete the event physically
                await Event.findByIdAndDelete(event._id);
                
                hardDeletedCount++;
            } 
            // STRATEGY 2: PAID EVENTS (price > 0) -> SOFT DELETE (ARCHIVE)
            // Reason: Fiscal laws (Italy) and Stripe rules require keeping transaction records for 10 years.
            // Action: Set status to 'archived'. Data remains in DB but hidden from public API.
            else {
                console.log(`📦 Archiving Paid Event (Fiscal Retention): ${event.title}`);
                
                // 1. Archive tickets (Soft Delete)
                await Ticket.updateMany(
                    { event: event._id },
                    { $set: { status: 'archived' } }
                );
                
                // 2. Archive event (Soft Delete)
                event.status = 'archived';
                await event.save();
                
                archivedCount++;
            }
        }
        
        if (hardDeletedCount > 0 || archivedCount > 0) {
            console.log(`✅ Smart Cleanup Complete: ${hardDeletedCount} Hard Deleted (Free), ${archivedCount} Archived (Paid).`);
        }
    } catch (error) {
        console.error("❌ Auto-cleanup error:", error);
    }
};

// Run cleanup on server startup
cleanupExpiredEvents();

// Run cleanup every hour
setInterval(cleanupExpiredEvents, 3600000);


// ==========================================
// ROUTES
// ==========================================

// --- AUTH ---

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
            favorites: []
        });

        const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        await mailer.sendWelcomeEmail(newUser.email, name);

        res.json({ token, user: newUser });
    } catch (e) {
        console.error("Register Error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
             return res.status(400).json({ error: "Missing credentials" });
        }

        const escapedEmail = escapeRegex(email.trim());
        const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } 
        });

        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        // COMPLIANCE CHECK: Is Soft Deleted?
        // Admin can still login if deleted? Probably not, keeping strict check.
        if (user.isDeleted) {
            return res.status(403).json({ error: "Account cancellato o sospeso." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (e) {
        console.error("Login Error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user || user.isDeleted) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

// Update Profile
app.put('/api/users/:id', authMiddleware, async (req, res) => {
    if (req.user.userId !== req.params.id) return res.status(403).json({ error: "Unauthorized" });
    
    if (req.body.email) {
        req.body.email = req.body.email.toLowerCase().trim();
    }

    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

// DELETE ACCOUNT (Smart Delete: Hard if no paid history, Soft if paid history)
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
    if (req.user.userId !== req.params.id) return res.status(403).json({ error: "Unauthorized" });
    
    try {
        // 1. Check for Paid Transaction History (Fiscal Requirement)
        // Check if they bought something paid
        const hasPaidOrders = await Order.exists({
            userId: req.params.id,
            status: 'completed',
            totalAmountCents: { $gt: 0 }
        });

        // Check if they sold something paid (Organization) - To fully comply with Privacy Policy text
        const hasSoldPaidEvents = await Event.exists({
            organization: req.params.id,
            price: { $gt: 0 },
            ticketsSold: { $gt: 0 }
        });

        const mustRetainData = hasPaidOrders || hasSoldPaidEvents;

        if (mustRetainData) {
            // SOFT DELETE (Fiscal Retention)
            await User.findByIdAndUpdate(req.params.id, {
                isDeleted: true,
                deletedAt: new Date(),
                // We keep record as is, just flagged deleted, as required for fiscal audit (Art. 2220 CC)
            });
            console.log(`🔒 Soft Deleted User ${req.params.id} (Fiscal Retention Active)`);
            return res.json({ success: true, message: "Account disattivato. I dati fiscali verranno conservati per i termini di legge." });
        } else {
            // HARD DELETE (GDPR Minimization - Right to be forgotten)
            // 1. Delete Tickets owned by user
            await Ticket.deleteMany({ owner: req.params.id });

            // 2. Delete Events created by user (if any - e.g. free events)
            await Event.deleteMany({ organization: req.params.id });

            // 3. Delete User physically
            await User.findByIdAndDelete(req.params.id);
            
            console.log(`🗑️ Hard Deleted User ${req.params.id} (No financial history - Full GDPR Cleanup)`);
            return res.json({ success: true, message: "Account e tutti i dati associati cancellati definitivamente." });
        }
    } catch (e) {
        console.error("Delete Account Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// Toggle Favorite
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

// Get Favorite Events
app.get('/api/users/favorites/list', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate({
            path: 'favorites',
            populate: { path: 'organization', select: 'name _id' }
        });
        res.json(user.favorites);
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


// ==========================================
// ADMIN ROUTES
// ==========================================

// Get All Users (Admin)
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get All Events (Admin)
app.get('/api/admin/events', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Find all events regardless of status
        const events = await Event.find({}).populate('organization', 'name email').sort({ date: -1 });
        res.json(events);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get User Tickets (Admin)
app.get('/api/admin/users/:id/tickets', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const tickets = await Ticket.find({ owner: req.params.id })
            .populate({ path: 'event', select: 'title date' })
            .sort({ purchaseDate: -1 });
        res.json(tickets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Verify User (Admin - useful for Associations)
app.put('/api/admin/users/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        
        user.isVerified = !user.isVerified; // Toggle
        await user.save();
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Restore User (Admin - Reverse Soft Delete)
app.put('/api/admin/users/:id/restore', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            isDeleted: false,
            deletedAt: null
        }, { new: true });
        
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// --- EVENTS ---

app.get('/api/events', async (req, res) => {
    try {
        const { organization } = req.query;
        let query = {};

        if (organization) {
            // CASE 1: ASSOCIATION DASHBOARD
            query.organization = organization;
            // Show 'active', 'archived' OR 'draft' (Association must see drafts)
            // Also support legacy documents with no status
            query.$or = [
                { status: { $in: ['active', 'archived', 'draft'] } },
                { status: { $exists: false } }
            ];
        } else {
            // CASE 2: PUBLIC / STUDENTS (Home Page)
            // Show only 'active' or legacy. Hide 'draft' and 'archived' and 'deleted'.
            query.$or = [
                { status: 'active' },
                { status: { $exists: false } }
            ];

            const now = new Date();
            const currentHour = now.getHours();
            
            const visibilityCutoff = new Date();
            visibilityCutoff.setHours(0, 0, 0, 0); // Start of Today

            if (currentHour < 10) {
                // Before 10 AM: Show events from Yesterday onwards
                visibilityCutoff.setDate(visibilityCutoff.getDate() - 1); 
            } 
            // After 10 AM: Show events from Today onwards

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
        
        if (!user.isVerified) {
            return res.status(403).json({ error: "Account not verified." });
        }

        if (req.body.price !== undefined) {
            // Forza l'arrotondamento corretto anche lato server per sicurezza
            req.body.price = Math.round((Number(req.body.price) + Number.EPSILON) * 100) / 100;
        }

        let { 
            title, description, longDescription, image, date, time, 
            location, price, maxCapacity, category, prLists, status,
            requiresMatricola, scanType
        } = req.body;

        if (price < 0) return res.status(400).json({ error: "Price cannot be negative" });
        if (maxCapacity <= 0) return res.status(400).json({ error: "Max capacity must be > 0" });
        
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (inputDate < today) return res.status(400).json({ error: "Event date cannot be in the past" });

        const newEvent = await Event.create({
            title, 
            description, 
            longDescription, 
            image, 
            date, 
            time, 
            location, 
            price, 
            maxCapacity, 
            category, 
            prLists,
            organization: req.user.userId,
            stripeAccountId: user.stripeAccountId,
            ticketsSold: 0,
            favoritesCount: 0,
            status: status || 'active',
            requiresMatricola: !!requiresMatricola,
            scanType: scanType || 'entry_only'
        });

        await newEvent.populate('organization', 'name _id');
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

        if (req.body.price !== undefined) {
             // Forza l'arrotondamento corretto anche lato server per sicurezza
             req.body.price = Math.round((Number(req.body.price) + Number.EPSILON) * 100) / 100;
        }

        let { 
            title, description, longDescription, image, date, time, 
            location, maxCapacity, category, prLists, price, status,
            requiresMatricola, scanType
        } = req.body;

        const updated = await Event.findByIdAndUpdate(req.params.id, {
            title, description, longDescription, image, date, time, 
            location, maxCapacity, category, prLists,
            ...(price !== undefined && { price }),
            ...(status !== undefined && { status }),
            ...(requiresMatricola !== undefined && { requiresMatricola }),
            ...(scanType !== undefined && { scanType })
        }, { new: true }).populate('organization', 'name _id');

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

        // SOFT DELETE
        event.status = 'deleted';
        await event.save();
        
        await Ticket.updateMany({ event: req.params.id }, { $set: { status: 'deleted' } });

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
        
        // CHECK: Allow if Owner OR Admin
        if (event.organization.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const tickets = await Ticket.find({ event: eventId });
        
        // FIX: Calculate favorites count dynamically
        const favoritesRealCount = await User.countDocuments({ favorites: new mongoose.Types.ObjectId(eventId) });

        if (event.favoritesCount !== favoritesRealCount) {
            await Event.findByIdAndUpdate(eventId, { favoritesCount: favoritesRealCount });
        }

        const stats = {
            favorites: favoritesRealCount
        };
        
        tickets.forEach(t => {
            const list = t.prList || "Nessuna lista";
            stats[list] = (stats[list] || 0) + 1;
        });
        res.json(stats);
    } catch (e) {
        console.error("Stats Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// New Route: Get Attendees List
app.get('/api/events/:id/attendees', authMiddleware, async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        
        if (!event) return res.status(404).json({ error: "Event not found" });
        
        if (event.organization.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const tickets = await Ticket.find({ event: eventId, status: { $ne: 'deleted' } })
            .select('ticketHolderName matricola status entryTime exitTime prList purchaseDate')
            .sort({ ticketHolderName: 1 });
            
        res.json(tickets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- TICKETS / WALLET ---

app.get('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const { owner } = req.query;
        if (owner && owner !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });
        
        // 1. Fetch tickets (exclude deleted)
        const tickets = await Ticket.find({ 
            owner: req.user.userId, 
            $or: [
                { status: { $ne: 'deleted' } },
                { status: { $exists: false } }
            ]
        }).populate('event');
        
        // 2. Filter tickets for Student View (10 AM rule)
        const now = new Date();
        const currentHour = now.getHours();
        
        const visibilityCutoff = new Date();
        visibilityCutoff.setHours(0, 0, 0, 0); 

        if (currentHour < 10) {
            visibilityCutoff.setDate(visibilityCutoff.getDate() - 1); 
        }
        
        const visibleTickets = tickets.filter(ticket => {
            if (!ticket.event) return false; 
            
            // Check event status
            const evStatus = ticket.event.status;
            if (evStatus === 'deleted' || evStatus === 'archived') return false; 
            // Also hide draft tickets if any somehow exist (shouldn't happen but safe to add)
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
        if (req.user.role !== 'associazione') return res.status(403).json({ error: "Unauthorized" });

        const { qrCodeId } = req.body;
        const ticket = await Ticket.findOne({ qrCodeId }).populate('event');

        if (!ticket) return res.status(404).json({ error: "INVALID_TICKET" });
        if (ticket.status === 'deleted') return res.status(400).json({ error: "TICKET_INVALID_DELETED" });

        const orgId = typeof ticket.event.organization === 'object' ? ticket.event.organization._id.toString() : ticket.event.organization.toString();
        
        if (orgId !== req.user.userId) return res.status(403).json({ error: "WRONG_EVENT_ORGANIZER" });

        const event = ticket.event;
        const scanType = event.scanType || 'entry_only';

        let message = "Voucher Valid";
        let action = "check-in";

        if (scanType === 'entry_only') {
             // Classic behavior
             if (ticket.used || ticket.status === 'completed') {
                 return res.status(400).json({ error: "ALREADY_USED" });
             }
             ticket.used = true;
             ticket.status = 'completed';
             ticket.checkInDate = new Date();
             ticket.entryTime = new Date(); // Set entry time as well for consistency
             message = "Ingresso Registrato";
        } else {
            // Entry/Exit Logic
            // Legacy 'active' or 'valid' -> Entered
            if (ticket.status === 'valid' || ticket.status === 'active' || !ticket.status) {
                ticket.status = 'entered';
                ticket.entryTime = new Date();
                message = "Ingresso Registrato";
                action = "entry";
            } 
            else if (ticket.status === 'entered') {
                ticket.status = 'completed';
                ticket.exitTime = new Date();
                ticket.used = true; // Mark used when cycle complete
                message = "Uscita Registrata";
                action = "exit";
            }
            else if (ticket.status === 'completed') {
                return res.status(400).json({ error: "ALREADY_USED" }); // Already exited
            }
        }

        await ticket.save();

        // Attach action and message to response
        const response = ticket.toObject();
        response.scanAction = action; 
        response.scanMessage = message;

        res.json(response);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- STRIPE ---
app.post('/api/stripe/connect', authMiddleware, StripeController.createConnectAccount);
app.post('/api/stripe/create-checkout-session', authMiddleware, StripeController.createCheckoutSession);
app.post('/api/stripe/verify', authMiddleware, StripeController.verifyPayment);

// --- SERVE STATIC FILES (ALWAYS) ---
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Listen
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
