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
// ROUTES
// ==========================================

// --- AUTH ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, role, surname, description, socialLinks } = req.body;
        
        // Check existing
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine verification status
        const isVerified = (role === 'studente');

        const newUser = await User.create({
            email,
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

        // Send Welcome Email (Non-blocking)
        mailer.sendWelcomeEmail(email, name).catch(err => console.error("Welcome email failed", err));

        res.json({ token, user: newUser });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (e) {
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
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

// Toggle Favorite
app.post('/api/users/favorites/toggle', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.body;
        const user = await User.findById(req.user.userId);
        
        const index = user.favorites.indexOf(eventId);
        if (index === -1) {
            user.favorites.push(eventId); // Add
        } else {
            user.favorites.splice(index, 1); // Remove
        }
        
        await user.save();
        res.json(user.favorites); // Return updated list
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Favorite Events (Populated)
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


// Refresh Stripe Status specifically
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
        if (organization) query.organization = organization;

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
            return res.status(403).json({ error: "Account not verified. Please contact support to activate your association account." });
        }

        const { 
            title, description, longDescription, image, date, time, 
            location, price, maxCapacity, category, prLists 
        } = req.body;

        if (price < 0) return res.status(400).json({ error: "Price cannot be negative" });
        if (maxCapacity <= 0) return res.status(400).json({ error: "Max capacity must be greater than 0" });
        if (new Date(date) < new Date()) return res.status(400).json({ error: "Event date cannot be in the past" });

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
            ticketsSold: 0
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

        const { 
            title, description, longDescription, image, date, time, 
            location, maxCapacity, category, prLists 
        } = req.body;

        const updated = await Event.findByIdAndUpdate(req.params.id, {
            title, description, longDescription, image, date, time, 
            location, maxCapacity, category, prLists
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
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });
        if (event.organization.toString() !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });

        const tickets = await Ticket.find({ event: req.params.id });
        const stats = {};
        tickets.forEach(t => {
            const list = t.prList || "Nessuna lista";
            stats[list] = (stats[list] || 0) + 1;
        });
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- TICKETS / WALLET ---

app.get('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const { owner } = req.query;
        if (owner && owner !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });
        const tickets = await Ticket.find({ owner: req.user.userId }).populate('event');
        res.json(tickets);
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
        if (ticket.event.organization.toString() !== req.user.userId) return res.status(403).json({ error: "WRONG_EVENT_ORGANIZER" });
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
// Serve any static files
app.use(express.static(path.join(__dirname, '../dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Listen
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});