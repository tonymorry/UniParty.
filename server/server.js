
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const StripeController = require('./stripe');
const { User, Event, Ticket, Order, Notification, Report, PRRequest } = require('./models');
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

// ==========================================
// HELPERS
// ==========================================
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// ==========================================
// ROUTES
// ==========================================

// --- AUTH ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, role, surname, description, socialLinks } = req.body;
        if (!email || !password || !name) return res.status(400).json({ error: "Missing required fields" });

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

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.userId).populate('followedAssociations', 'name profileImage');
    if (!user || user.isDeleted) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

// --- PR SYSTEM ROUTES ---

app.post('/api/pr/request', authMiddleware, async (req, res) => {
  if (req.user.role !== 'studente') return res.status(403).json({ error: "Solo gli studenti possono candidarsi come PR" });
  try {
    const { associationId } = req.body;
    const existing = await PRRequest.findOne({ userId: req.user.userId, associationId, status: 'pending' });
    if (existing) return res.status(400).json({ error: "Richiesta già inviata" });

    const association = await User.findById(associationId);
    if (!association || association.role !== 'associazione') return res.status(404).json({ error: "Associazione non trovata" });

    const request = await PRRequest.create({ userId: req.user.userId, associationId });
    
    await Notification.create({
      recipient: associationId,
      title: "Nuova candidatura PR",
      message: `${req.user.name} vorrebbe diventare PR per la tua associazione.`,
      url: "/dashboard?tab=pr"
    });

    res.json(request);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/pr/requests', authMiddleware, async (req, res) => {
  if (req.user.role !== 'associazione') return res.status(403).json({ error: "Accesso negato" });
  try {
    const requests = await PRRequest.find({ associationId: req.user.userId, status: 'pending' }).populate('userId', 'name email profileImage');
    res.json(requests);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/pr/requests/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'associazione') return res.status(403).json({ error: "Accesso negato" });
  try {
    const { status } = req.body;
    const request = await PRRequest.findOne({ _id: req.params.id, associationId: req.user.userId });
    if (!request) return res.status(404).json({ error: "Richiesta non trovata" });

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      const prUser = await User.findById(request.userId);
      prUser.role = 'pr';
      prUser.parentOrganization = req.user.userId;
      await prUser.save();

      await Notification.create({
        recipient: request.userId,
        title: "Candidatura PR Accettata!",
        message: `Sei ora un PR ufficiale di ${req.user.name}.`,
        url: "/pr-dashboard"
      });
    }

    res.json(request);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/pr/list', authMiddleware, async (req, res) => {
  if (req.user.role !== 'associazione') return res.status(403).json({ error: "Accesso negato" });
  try {
    const prs = await User.find({ role: 'pr', parentOrganization: req.user.userId }).select('name email profileImage');
    res.json(prs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/pr/list/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'associazione') return res.status(403).json({ error: "Accesso negato" });
  try {
    const pr = await User.findOne({ _id: req.params.id, parentOrganization: req.user.userId, role: 'pr' });
    if (!pr) return res.status(404).json({ error: "PR non trovato" });

    pr.role = 'studente';
    pr.parentOrganization = undefined;
    await pr.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/pr/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'pr') return res.status(403).json({ error: "Solo i PR possono accedere a queste statistiche" });
  try {
    const prName = (await User.findById(req.user.userId)).name;
    const tickets = await Ticket.find({ prList: prName }).populate('event', 'title date');
    
    const statsByEvent = {};
    tickets.forEach(t => {
      const evId = t.event._id.toString();
      if (!statsByEvent[evId]) {
        statsByEvent[evId] = { title: t.event.title, count: 0, date: t.event.date };
      }
      statsByEvent[evId].count++;
    });

    res.json(Object.values(statsByEvent));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- REMAINING ROUTES ---

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

app.get('/api/events', async (req, res) => {
    try {
        const { organization, public: isPublic } = req.query;
        let query = {};
        if (organization) {
            query.organization = organization;
            if (isPublic === 'true') {
                 query.status = 'active';
            }
        } else {
            query.status = 'active';
            const now = new Date();
            now.setHours(0,0,0,0);
            query.date = { $gte: now };
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
        const newEvent = await Event.create({ ...req.body, organization: req.user.userId, stripeAccountId: user.stripeAccountId });
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
        const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('organization', 'name _id');
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
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/events/:id/attendees', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event || (event.organization.toString() !== req.user.userId && req.user.role !== 'admin')) return res.status(403).json({ error: "Unauthorized" });
        const tickets = await Ticket.find({ event: req.params.id, status: { $ne: 'deleted' } }).sort({ ticketHolderName: 1 });
        res.json(tickets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/events/:id/stats', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event || (event.organization.toString() !== req.user.userId && req.user.role !== 'admin')) return res.status(403).json({ error: "Unauthorized" });
        const tickets = await Ticket.find({ event: req.params.id });
        const stats = { favorites: event.favoritesCount || 0 };
        tickets.forEach(t => {
            const list = t.prList || "Nessuna lista";
            stats[list] = (stats[list] || 0) + 1;
        });
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const tickets = await Ticket.find({ owner: req.user.userId }).populate('event');
        res.json(tickets);
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
        
        const orgId = typeof ticket.event.organization === 'object' ? ticket.event.organization._id.toString() : ticket.event.organization.toString();
        if (orgId !== req.user.userId && (req.user.role !== 'staff' || req.user.parentOrganization?.toString() !== orgId)) {
             return res.status(403).json({ error: "WRONG_EVENT_ORGANIZER" });
        }

        if (ticket.used) return res.status(400).json({ error: "ALREADY_USED" });
        ticket.used = true;
        ticket.checkInDate = new Date();
        ticket.status = 'completed';
        await ticket.save();
        res.json(ticket);
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
