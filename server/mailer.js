const nodemailer = require('nodemailer');

// Configurazione Gmail Ottimizzata per Render (Porta 587 + IPv4)
// L'errore ETIMEDOUT su 465 indica spesso un blocco. 587 è più affidabile.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Opzioni di rete fondamentali per evitare timeout su Render
  family: 4, // Forza IPv4 (Risolve ETIMEDOUT causato da IPv6)
  logger: true,
  debug: true,
  // Timeout settings
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000
});

// Verifica connessione immediata
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP CONNECTION ERROR:", error);
  } else {
    console.log("✅ SMTP Server is ready (IPv4/Gmail via Service)");
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
    // Non rilanciamo l'errore per non bloccare il flusso utente se l'email fallisce
  }
};

const sendTicketsEmail = async (to, ticketNames, eventTitle) => {
  try {
    console.log(`📤 Attempting to send TICKETS email to: ${to}`);
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
          <p>You can find your QR codes in the <a href="${process.env.FRONTEND_URL || 'https://uniparty-app.onrender.com'}/#/wallet">My Wallet</a> section.</p>
        </div>
      `,
    });
    console.log("📨 Tickets email sent ID:", info.messageId);
  } catch (error) {
    console.error("❌ Tickets email failed:", error);
    // Qui l'errore è più critico, ma non vogliamo crashare il webhook
  }
};

module.exports = {
  sendWelcomeEmail,
  sendTicketsEmail
};