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
// AUTOMATIC CLEANUP (CRON-LIKE TASK)
// ==========================================
const cleanupExpiredEvents = async () => {
    try {
        console.log("🧹 Running scheduled cleanup for expired events (5 Days Policy)...");
        const events = await Event.find();
        const now = new Date();

        let deletedCount = 0;

        for (const event of events) {
            // Calculate Hard Deletion Date: Event Date + 5 Days at 10:00 AM
            const eventDate = new Date(event.date);
            const expirationDate = new Date(eventDate);
            expirationDate.setDate(expirationDate.getDate() + 5); // KEEP FOR 5 DAYS
            expirationDate.setHours(10, 0, 0, 0); // At 10:00 AM

            if (now > expirationDate) {
                console.log(`🗑️ Deleting old event (5+ days passed): ${event.title}`);
                
                // 1. Delete associated tickets
                await Ticket.deleteMany({ event: event._id });
                
                // 2. Delete the event itself
                await Event.findByIdAndDelete(event._id);
                
                deletedCount++;
            }
        }
        
        if (deletedCount > 0) {
            console.log(`✅ Cleanup complete. Permanently deleted ${deletedCount} old events.`);
        }
    } catch (error) {
        console.error("❌ Auto-delete error:", error);
    }
};

// Run cleanup on server startup
cleanupExpiredEvents();

// Run cleanup every hour (3600000 ms)
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

        mailer.sendWelcomeEmail(newUser.email, name).catch(err => console.error("Welcome email failed", err));

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

// Toggle Favorite
app.post('/api/users/favorites/toggle', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.body;
        const user = await User.findById(req.user.userId);
        
        // FIX: Properly compare ObjectIds with String IDs using toString()
        const index = user.favorites.findIndex(fav => fav.toString() === eventId);
        
        if (index === -1) {
            // Add Favorite
            user.favorites.push(eventId);
            // Increment logic (Best effort, self-heals in stats)
            await Event.findByIdAndUpdate(eventId, { $inc: { favoritesCount: 1 } });
        } else {
            // Remove Favorite
            user.favorites.splice(index, 1);
            // Decrement logic
            await Event.findByIdAndUpdate(eventId, { $inc: { favoritesCount: -1 } });
        }
        
        await user.save();
        res.json(user.favorites); // Return updated list
    } catch (e) {
        console.error("Toggle Favorite Error:", e);
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
            // Dashboard Request
            query.organization = organization;
        } else {
            // Public Request
            const now = new Date();
            const currentHour = now.getHours();
            
            const visibilityCutoff = new Date();
            visibilityCutoff.setHours(0, 0, 0, 0); // Start of Today

            if (currentHour < 10) {
                visibilityCutoff.setDate(visibilityCutoff.getDate() - 1); // Start of Yesterday
            } 

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

        // Force numeric conversion and rounding to 2 decimals on server side as well
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
            favoritesCount: 0
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

        // Force numeric conversion and rounding to 2 decimals
        // Note: Price might not be editable depending on logic, but if it is, sanitize it.
        if (price !== undefined) {
             price = Math.round(Number(price) * 100) / 100;
        }

        const updated = await Event.findByIdAndUpdate(req.params.id, {
            title, description, longDescription, image, date, time, 
            location, maxCapacity, category, prLists,
            // Only update price if provided, otherwise keep existing
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

        await Ticket.deleteMany({ event: req.params.id });
        await Event.findByIdAndDelete(req.params.id);
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
        
        // FIX: Explicitly count distinct users who have this event ID in their favorites array.
        const favoritesRealCount = await User.countDocuments({ favorites: new mongoose.Types.ObjectId(eventId) });

        // Self-Healing
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
        
        const tickets = await Ticket.find({ owner: req.user.userId }).populate('event');
        
        const now = new Date();
        const currentHour = now.getHours();
        
        const visibilityCutoff = new Date();
        visibilityCutoff.setHours(0, 0, 0, 0); 

        if (currentHour < 10) {
            visibilityCutoff.setDate(visibilityCutoff.getDate() - 1); 
        }
        
        const visibleTickets = tickets.filter(ticket => {
            if (!ticket.event) return false; 
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