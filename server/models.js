
const mongoose = require('mongoose');

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, // Forces email to lowercase on save
    trim: true       // Removes whitespace
  },
  password: { type: String, required: true }, // Will be hashed
  name: { type: String, required: true },
  role: { type: String, enum: ['studente', 'associazione'], required: true },
  profileImage: { type: String, default: '' },
  
  // Verification Status
  isVerified: { type: Boolean, default: false },

  // GDPR & Fiscal Compliance (Soft Delete)
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },

  // Student specific
  surname: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], // Array of Favorite Events
  
  // Association specific
  description: String,
  socialLinks: String,
  stripeAccountId: { type: String, default: '' }, // The 'Connected Account' ID (e.g., acct_12345)
  stripeOnboardingComplete: { type: Boolean, default: false }
}, { timestamps: true });

// --- EVENT SCHEMA ---
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  longDescription: String,
  image: String,
  date: { type: Date, required: true },
  time: String,
  location: String,
  price: { type: Number, required: true, default: 0 },
  maxCapacity: { type: Number, required: true },
  ticketsSold: { type: Number, default: 0 },
  category: { type: String, default: 'Other' },
  
  // Organization reference
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // PR Lists
  prLists: [String],
  
  // Favorites Counter
  favoritesCount: { type: Number, default: 0 },

  // Status for soft delete/archiving
  status: { type: String, enum: ['active', 'draft', 'archived', 'deleted'], default: 'active' },

  // --- ACADEMIC / SEMINAR FEATURES ---
  requiresMatricola: { type: Boolean, default: false },
  scanType: { type: String, enum: ['entry_only', 'entry_exit'], default: 'entry_only' }
}, { timestamps: true });

// --- TICKET SCHEMA ---
const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  ticketHolderName: { type: String, required: true },
  qrCodeId: { type: String, required: true, unique: true },
  purchaseDate: { type: Date, default: Date.now },
  prList: { type: String, default: 'Nessuna lista' },
  
  // Academic Fields
  matricola: { type: String },
  entryTime: { type: Date },
  exitTime: { type: Date },

  used: { type: Boolean, default: false }, // Kept for legacy compatibility (true if completed)
  checkInDate: Date, // Kept for legacy compatibility (synced with entryTime)
  
  // Stripe Data
  paymentIntentId: String,
  sessionId: String,

  // Status
  // 'valid'/'active': Ready to be used
  // 'entered': Inside the event (for entry_exit)
  // 'completed': Finished (Exit scanned or Entry scanned for simple events)
  status: { type: String, enum: ['active', 'valid', 'entered', 'completed', 'archived', 'deleted'], default: 'valid' }
}, { timestamps: true });

// --- ORDER SCHEMA ---
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketNames: [String], // Array of names
  ticketMatricolas: [String], // Array of matricolas (parallel to names)
  prList: { type: String, default: 'Nessuna lista' },
  quantity: { type: Number, required: true },
  totalAmountCents: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  stripeSessionId: { type: String },
  
  createdAt: { type: Date, default: Date.now, expires: 86400 } 
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Event: mongoose.model('Event', eventSchema),
  Ticket: mongoose.model('Ticket', ticketSchema),
  Order: mongoose.model('Order', orderSchema)
};
