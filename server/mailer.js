const nodemailer = require('nodemailer');

// Configure Transporter
// Ensure these variables are set in your .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
          <br/>
          <p>Cheers,<br/>The UniParty Team</p>
        </div>
      `,
    });
    console.log("📨 Welcome email sent: %s", info.messageId);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
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
          <h1 style="color: #4f46e5;">Order Confirmed!</h1>
          <p>You have successfully purchased tickets for <strong>${eventTitle}</strong>.</p>
          <p>Here are the ticket holders:</p>
          <ul>
            ${namesList}
          </ul>
          <p>You can find your QR codes in your <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/wallet">UniParty Wallet</a>.</p>
          <br/>
          <p>See you there,<br/>The UniParty Team</p>
        </div>
      `,
    });
    console.log("📨 Tickets email sent: %s", info.messageId);
  } catch (error) {
    console.error("❌ Error sending tickets email:", error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendTicketsEmail
};
