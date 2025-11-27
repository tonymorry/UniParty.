const { Resend } = require('resend');

// Initialize Resend with API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://uniparty-app.onrender.com';

const sendWelcomeEmail = async (to, name) => {
  try {
    console.log(`📤 Attempting to send WELCOME email via Resend to: ${to}`);
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to,
      subject: "Welcome to UniParty! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #4f46e5;">Welcome to UniParty, ${name}!</h1>
          <p>We are thrilled to have you on board.</p>
          <p>Start browsing events, buy tickets, or organize the next big party on campus.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend Welcome Email Error:", error);
      return;
    }

    console.log("📨 Welcome email sent successfully. ID:", data.id);
  } catch (error) {
    console.error("❌ Unexpected Error sending Welcome Email:", error);
  }
};

const sendTicketsEmail = async (to, ticketNames, eventTitle) => {
  try {
    console.log(`📤 Attempting to send TICKETS email via Resend to: ${to}`);
    const namesList = ticketNames.map(name => `<li><strong>${name}</strong></li>`).join('');
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to,
      subject: `Your Tickets for ${eventTitle} 🎟️`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #4f46e5;">You're going to ${eventTitle}!</h1>
          <p>Your payment was successful and your tickets have been issued.</p>
          <p><strong>Ticket Holders:</strong></p>
          <ul>${namesList}</ul>
          <p>You can find your QR codes in the <a href="${FRONTEND_URL}/#/wallet">My Wallet</a> section.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend Tickets Email Error:", error);
      return;
    }

    console.log("📨 Tickets email sent successfully. ID:", data.id);
  } catch (error) {
    console.error("❌ Unexpected Error sending Tickets Email:", error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendTicketsEmail
};