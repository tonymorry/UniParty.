
const Stripe = require('stripe');
const { User, Event, Ticket, Order } = require('./models');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const mailer = require('./mailer'); // Import Mailer

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// FIX: CONSTANT FEE IN CENTS (INTEGER)
const APPLICATION_FEE_CENTS = 40; 

// Helper to process a successful order (Shared logic)
const processSuccessfulOrder = async (order, session, dbSession) => {
    // 1. Update Event Sold Count
    const eventDoc = await Event.findByIdAndUpdate(
        order.eventId, 
        { $inc: { ticketsSold: order.quantity } },
        { new: true, session: dbSession }
    );

    if (!eventDoc) {
       throw new Error("Event not found during processing");
    }

    // 2. Generate Tickets
    const ticketsToCreate = [];
    for (let i = 0; i < order.ticketNames.length; i++) {
        const name = order.ticketNames[i];
        const matricola = order.ticketMatricolas && order.ticketMatricolas[i] ? order.ticketMatricolas[i] : undefined;

        ticketsToCreate.push({
            event: order.eventId,
            owner: order.userId,
            ticketHolderName: name || "Guest",
            matricola: matricola,
            qrCodeId: uuidv4(), 
            prList: order.prList,
            used: false,
            status: 'valid',
            sessionId: session.id,
            paymentIntentId: session.payment_intent
        });
    }

    await Ticket.insertMany(ticketsToCreate, { session: dbSession });

    // 3. Mark Order as Completed
    order.status = 'completed';
    await order.save({ session: dbSession });
    
    return { eventDoc, ticketsToCreate };
};

const StripeController = {
  
  /**
   * 1. CREATE CONNECT ACCOUNT (Standard)
   */
  createConnectAccount: async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);

      if (!user) return res.status(404).json({ error: "User not found" });

      // Create a Standard account for the user
      const account = await stripe.accounts.create({
        type: 'standard',
        email: user.email,
        business_profile: {
           name: user.name,
           product_description: "University Events Tickets"
        }
      });

      // Update User DB with the new account ID
      user.stripeAccountId = account.id;
      await user.save();

      // Create the Account Link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${FRONTEND_URL}/#/dashboard`, 
        return_url: `${FRONTEND_URL}/#/dashboard?stripe_setup=success`,
        type: 'account_onboarding',
      });

      res.json({ url: accountLink.url });
    } catch (error) {
      console.error("Stripe Connect Error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 2. CREATE CHECKOUT SESSION (Direct Charge)
   * UPDATED: Creates an Order in DB first to handle large data sets safely.
   */
  createCheckoutSession: async (req, res) => {
    try {
      const { eventId, quantity, ticketNames, ticketMatricolas, prList, userId } = req.body;

      // 1. Validations
      if (!ticketNames || ticketNames.length !== quantity) {
          return res.status(400).json({ error: "Mismatch between quantity and ticket names" });
      }

      const event = await Event.findById(eventId).populate('organization');
      if (!event) return res.status(404).json({ error: "Event not found" });

      const organizer = event.organization;
      
      if (!organizer.stripeAccountId || !organizer.stripeOnboardingComplete) {
          return res.status(400).json({ error: "Organizer has not set up payments." });
      }

      // Check capacity
      if (event.ticketsSold + quantity > event.maxCapacity) {
          return res.status(400).json({ error: "Not enough tickets available" });
      }

      // 2. PRICE CALCULATION (STRICT INTEGER MATH)
      // Convert stored price (Euro float) to Cents (Integer) using round to fix floating point errors
      const unitPriceCents = Math.round(Number(event.price) * 100); 
      
      // Fixed Fee
      const feeCents = APPLICATION_FEE_CENTS;
      
      // Total User Pays per ticket
      const totalPerTicketCents = unitPriceCents + feeCents;

      // 3. Create Pending Order in DB
      const newOrder = await Order.create({
          userId,
          eventId,
          ticketNames,
          ticketMatricolas: ticketMatricolas || [], // Save matricolas
          prList: prList || "Nessuna lista",
          quantity,
          totalAmountCents: totalPerTicketCents * quantity,
          status: 'pending'
      });

      // 4. Create Stripe Session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Voucher: ${event.title}`,
                description: `${new Date(event.date).toISOString().split('T')[0]} @ ${event.location}`,
              },
              // CRITICAL: Ensure this is an integer
              unit_amount: Math.round(totalPerTicketCents), 
            },
            quantity: quantity,
          },
        ],
        payment_intent_data: {
          // Platform fee is exactly 40 cents * quantity
          application_fee_amount: Math.round(feeCents * quantity),
        },
        success_url: `${FRONTEND_URL}/#/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}/#/events/${eventId}`,
        
        metadata: {
            orderId: newOrder._id.toString()
        },
      }, {
        stripeAccount: organizer.stripeAccountId, // Direct Charge to Organizer
      });

      // Update order with session ID for reference
      newOrder.stripeSessionId = session.id;
      await newOrder.save();

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout Error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 3. VERIFY PAYMENT (Called by Frontend Success Page)
   */
  verifyPayment: async (req, res) => {
    const { sessionId } = req.body;
    
    if (!sessionId) return res.status(400).json({ error: "Missing Session ID" });

    // Start a Transaction Session
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
        const order = await Order.findOne({ stripeSessionId: sessionId }).session(dbSession);
        
        if (!order) {
            await dbSession.abortTransaction();
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.status === 'completed') {
            await dbSession.abortTransaction();
            return res.json({ success: true, message: "Already processed" });
        }

        const event = await Event.findById(order.eventId).populate('organization');
        const stripeAccountId = event.organization.stripeAccountId;

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            stripeAccount: stripeAccountId
        });

        if (session.payment_status !== 'paid') {
            await dbSession.abortTransaction();
            return res.status(400).json({ error: "Payment not paid" });
        }

        console.log(`💰 Verifying Order ${order._id} (Force Process)...`);
        const { eventDoc } = await processSuccessfulOrder(order, session, dbSession);
        await dbSession.commitTransaction();
        
        try {
             const user = await User.findById(order.userId);
             if (user) {
                 await mailer.sendTicketsEmail(user.email, order.ticketNames, eventDoc.title);
             }
        } catch(emailErr) {
             console.error("Email error:", emailErr);
        }

        res.json({ success: true });

    } catch (error) {
        console.error("Verify Payment Error:", error);
        await dbSession.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        dbSession.endSession();
    }
  },

  /**
   * 4. WEBHOOK HANDLER
   */
  handleWebhook: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook Signature Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { orderId } = session.metadata;

      if (!orderId) return res.status(400).end();

      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();

      try {
          const order = await Order.findById(orderId).session(dbSession);
          
          if (!order) {
              await dbSession.abortTransaction();
              return res.status(404).end();
          }

          if (order.status === 'completed') {
              await dbSession.abortTransaction();
              return res.json({received: true});
          }

          console.log(`💰 Webhook Processing Order ${orderId}...`);
          const { eventDoc } = await processSuccessfulOrder(order, session, dbSession);
          await dbSession.commitTransaction();
          
          try {
             const user = await User.findById(order.userId);
             if (user) {
                 await mailer.sendTicketsEmail(user.email, order.ticketNames, eventDoc.title);
             }
          } catch(emailErr) {
              console.error("Email error:", emailErr);
          }

      } catch (dbError) {
          console.error("Webhook Transaction Error:", dbError);
          await dbSession.abortTransaction();
          return res.status(500).json({ error: "Transaction failed" });
      } finally {
          dbSession.endSession();
      }
    }

    res.json({received: true});
  }
};

module.exports = StripeController;
