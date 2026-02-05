
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
const mailer = require('./mailer'); // Import Mailer
const webPushConfig = require('./webPush'); // Import Web Push Config
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
                // Hard Delete Free Events
                await Ticket.deleteMany({ event: event._id });
                await Event.findByIdAndDelete(event._id);
                hardDeletedCount++;
            } 
            else {
                // Archive Paid Events
                await Ticket.updateMany(
                    { event: event._id },
                    { $set: { status: 'archived' } }
                );
                event.status = 'archived';
                await event.save();
                archivedCount++;
            }
            
            // Remove associated notifications for cleanup (Requested Change)
            await Notification.deleteMany({ relatedEvent: event._id });
        }
        
        if (hardDeletedCount > 0 || archivedCount > 0