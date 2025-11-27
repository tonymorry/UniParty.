require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StripeController = require('./stripe');
const { User, Event, Ticket } = require('./models');
const authMiddleware = require('./middleware');
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
// AUTOMATIC CLEANUP (ARCHIVING - LEGAL/FISCAL)
// ==========================================
const cleanupExpiredEvents = async () => {
    try {
        console.log("🧹 Running scheduled cleanup (Archiving Logic)...");
        // Check only ACTIVE events. Archived/Deleted ones are already handled.
        const events = await Event.find({ status: 'active' });
        const now = new Date();

        let archivedCount = 0;

        for (const event of events) {
            // Rule: Keep events active in dashboard for 5 days after execution
            const eventDate = new Date(event.date);
            const expirationDate = new Date(eventDate);
            expirationDate.setDate(expirationDate.getDate() + 5); // Add 5 days
            expirationDate.setHours(10, 0, 0, 0); // At 10:00 AM

            if (now > expirationDate) {
                console.log(`📦 Archiving old event (5+ days passed): ${event.title}`);
                
                // 1. Archive associated tickets (Soft Delete / Historicize)
                // We DO NOT DELETE data, we just mark it as archived.
                await Ticket.updateMany(
                    { event: event._id },
                    { $set: { status: 'archived' } }
                );
                
                // 2. Archive the event itself
                event.status = 'archived';
                await event.save();
                
                archivedCount++;
            }
        }
        
        if (archivedCount > 0) {
            console.log(`✅ Cleanup complete. Archived ${archivedCount} old events.`);
        }
    } catch (error) {
        console.error("❌ Auto-archiving error:", error);
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

// DELETE ACCOUNT
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
    if (req.user.userId !== req.params.id) return res.status(403).json({ error: "Unauthorized" });
    
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Account deleted" });
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

// --- EVENTS ---

app.get('/api/events', async (req, res) => {
    try {
        const { organization } = req.query;
        let query = {};

        if (organization) {
            // CASE 1: ASSOCIATION DASHBOARD / PROFILE
            // Associations must see 'active' AND 'archived' events.
            // We exclude only the manually 'deleted' ones.
            // This allows them to see the history (up to 5 days or until archived).
            query.organization = organization;
            query.status = { $in: ['active', 'archived'] };
        } else {
            // CASE 2: PUBLIC / STUDENTS (Home Page)
            // Logic: Show ONLY 'active' events.
            // AND apply strict time filter (10:00 AM rule).
            
            query.status = 'active';

            const now = new Date();
            const currentHour = now.getHours();
            
            const visibilityCutoff = new Date();
            visibilityCutoff.setHours(0, 0, 0, 0); // Start of Today

            if (currentHour < 10) {
                // Before 10 AM: Show events from Yesterday onwards
                visibilityCutoff.setDate(visibilityCutoff.getDate() - 1); 
            } 
            // After 10 AM: Show events from Today onwards (Yesterday is hidden)

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

        let { 
            title, description, longDescription, image, date, time, 
            location, price, maxCapacity, category, prLists 
        } = req.body;

        // Sanitization
        price = Math.round(Number(price) * 100) / 100;

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
            status: 'active' // Ensure new events are active
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

        let { 
            title, description, longDescription, image, date, time, 
            location, maxCapacity, category, prLists, price 
        } = req.body;

        if (price !== undefined) {
             price = Math.round(Number(price) * 100) / 100;
        }

        const updated = await Event.findByIdAndUpdate(req.params.id, {
            title, description, longDescription, image, date, time, 
            location, maxCapacity, category, prLists,
            ...(price !== undefined && { price })
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

        // SOFT DELETE (Legal Compliance)
        // Manual deletion by user marks as 'deleted'.
        // This removes it from dashboard and public view.
        event.status = 'deleted';
        await event.save();
        
        // Also soft delete tickets
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
        if (event.organization.toString() !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });

        const tickets = await Ticket.find({ event: eventId });
        
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

// --- TICKETS / WALLET ---

app.get('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const { owner } = req.query;
        if (owner && owner !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });
        
        // 1. Fetch tickets owned by user.
        // We ensure we only get tickets where the event is not 'deleted'.
        // 'archived' tickets are fetched but filtered below.
        const tickets = await Ticket.find({ 
            owner: req.user.userId,
            status: { $ne: 'deleted' } 
        }).populate('event');
        
        // 2. Filter tickets for Student View (10 AM rule)
        // Tickets should disappear from wallet if the event expired (> 10 AM next day)
        // OR if the event/ticket status is 'archived' (implicit from time check usually, but safer to enforce).
        const now = new Date();
        const currentHour = now.getHours();
        
        const visibilityCutoff = new Date();
        visibilityCutoff.setHours(0, 0, 0, 0); 

        if (currentHour < 10) {
            visibilityCutoff.setDate(visibilityCutoff.getDate() - 1); 
        }
        
        const visibleTickets = tickets.filter(ticket => {
            if (!ticket.event) return false; 
            
            // Public/Student should ONLY see 'active' tickets/events.
            // If an event is archived (5 days old) or manually archived, it shouldn't show in active wallet.
            if (ticket.event.status !== 'active') return false; 

            const eventDate = new Date(ticket.event.date);
            // Strict Time Check: Must be today (after 10am) or upcoming
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
        
        // Ensure ticket/event is not deleted (archived is ok to scan if late entry allowed)
        if (ticket.status === 'deleted') return res.status(400).json({ error: "TICKET_INVALID_DELETED" });

        const orgId = typeof ticket.event.organization === 'object' ? ticket.event.organization._id.toString() : ticket.event.organization.toString();
        
        if (orgId !== req.user.userId) return res.status(403).json({ error: "WRONG_EVENT_ORGANIZER" });
        if (ticket.used) return res.status(400).json({ error: "ALREADY_USED" });

        ticket.used = true;
        ticket.checkInDate = new Date();
        await ticket.save();

        res.json(ticket);
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