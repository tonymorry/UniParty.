const nodemailer = require('nodemailer');

// Configure Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: true, // Log to console
  debug: true   // Include debug info
});

const sendWelcomeEmail = async (to, name) => {
  try {
    const info = await transporter.sendMail({
      from: `"UniParty Team" <${process.env.SMTP_USER}>`,
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
    console.log("📨 Welcome email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Welcome email failed:", error);
  }
};

const sendTicketsEmail = async (to, ticketNames, eventTitle) => {
  try {
    const namesList = ticketNames.map(name => `<li><strong>${name}</strong></li>`).join('');
    
    const info = await transporter.sendMail({
      from: `"UniParty Team" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `Your Tickets for ${eventTitle} 🎟️`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #4f46e5;">You're going to ${eventTitle}!</h1>
          <p>Your payment was successful and your tickets have been issued.</p>
          <p><strong>Ticket Holders:</strong></p>
          <ul>${namesList}</ul>
          <p>You can find your QR codes in the <a href="${process.env.FRONTEND_URL || 'https://uniparty-app.onrender.com'}/#/wallet">My Wallet</a> section of the app.</p>
          <p>See you there!</p>
        </div>
      `,
    });
    console.log("📨 Tickets email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Tickets email failed:", error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendTicketsEmail
};