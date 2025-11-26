const nodemailer = require('nodemailer');

// Configurazione Gmail SSL (Porta 465) - Tentativo finale
// Usiamo SSL implicito che è spesso più stabile sui server cloud
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // IMPORTANTE: true per la porta 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Accetta certificati anche se imperfetti
  },
  family: 4, // Forza IPv4
  logger: true,
  debug: true,
  connectionTimeout: 30000, // Aumentato a 30 secondi
  greetingTimeout: 30000,   // Attende 30 secondi il saluto del server
  socketTimeout: 30000      // Attende 30 secondi per i dati
});

// Verifica connessione
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP CONNECTION ERROR:", error);
  } else {
    console.log("✅ SMTP Server is ready (Port 465/SSL/IPv4)");
  }
});

const sendWelcomeEmail = async (to, name) => {
  try {
    console.log(`📤 Attempting to send WELCOME email to: ${to}`);
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
    console.log("📨 Welcome email sent ID:", info.messageId);
  } catch (error) {
    console.error("❌ Welcome email failed:", error);
  }
};

const sendTicketsEmail = async (to, ticketNames, eventTitle) => {
  try {
    console.log(`📤 Attempting to send TICKETS email to: ${to}`);
    const namesList = Array.isArray(ticketNames) 
      ? ticketNames.map(name => `<li><strong>${name}</strong></li>`).join('') 
      : `<li>${ticketNames}</li>`;
    
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
          <p>You can find your QR codes in the <a href="${process.env.FRONTEND_URL || 'https://uniparty-app.onrender.com'}/#/wallet">My Wallet</a> section.</p>
        </div>
      `,
    });
    console.log("📨 Tickets email sent ID:", info.messageId);
  } catch (error) {
    console.error("❌ Tickets email failed:", error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendTicketsEmail
};
