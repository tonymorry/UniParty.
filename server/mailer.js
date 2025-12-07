

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
      subject: "Benvenuto in UniParty! 🚀",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
             <h1 style="color: #4338ca; margin: 0; font-size: 28px; letter-spacing: -1px;">UniParty</h1>
          </div>
          
          <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Ciao ${name}, benvenuto nel club!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Siamo felici di averti con noi. UniParty è il tuo pass per i migliori eventi universitari. Inizia subito a esplorare le feste e i meeting in programma nel tuo campus.
          </p>

          <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
            <a href="${FRONTEND_URL}" style="background-color: #4338ca; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Esplora Eventi
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 40px;">
            Divertiti responsabilmente! 🥂
          </p>
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
    
    const namesListHtml = ticketNames.map(name => 
      `<li style="margin-bottom: 8px; font-weight: 600; color: #374151;">${name}</li>`
    ).join('');
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to,
      subject: `I tuoi Voucher per ${eventTitle} 🎟️`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
           <div style="text-align: center; margin-bottom: 30px;">
             <h1 style="color: #4338ca; margin: 0; font-size: 28px; letter-spacing: -1px;">UniParty</h1>
          </div>

          <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Prenotazione Confermata!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Il pagamento è andato a buon fine. Ecco i dettagli dei tuoi ingressi per <strong>${eventTitle}</strong>:
          </p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <ul style="padding-left: 20px; margin: 0; color: #4b5563;">
              ${namesListHtml}
            </ul>
          </div>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Trovi i tuoi QR Code pronti per la scansione nella sezione <strong>My Wallet</strong> dell'app. Mostrali all'ingresso per saltare la fila!
          </p>

          <div style="text-align: center; margin-bottom: 40px;">
            <a href="${FRONTEND_URL}/#/wallet" style="background-color: #4338ca; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Vai al mio Wallet
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px;">
             <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
              <strong>Nota:</strong> Questo voucher vale come prenotazione. Il titolo fiscale di accesso (SIAE) verrà emesso dall'organizzatore direttamente all'ingresso dell'evento.
            </p>
          </div>
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

const sendPasswordResetEmail = async (to, token) => {
    try {
      console.log(`📤 Attempting to send PASSWORD RESET email via Resend to: ${to}`);
      
      const resetUrl = `${FRONTEND_URL}/#/reset-password/${token}`;
  
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: to,
        subject: "Recupero Password UniParty 🔒",
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
               <h1 style="color: #4338ca; margin: 0; font-size: 28px; letter-spacing: -1px;">UniParty</h1>
            </div>
            
            <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Recupero Password</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hai richiesto di reimpostare la password del tuo account UniParty. Clicca sul pulsante qui sotto per procedere.
            </p>
  
            <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
              <a href="${resetUrl}" style="background-color: #4338ca; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                Reimposta Password
              </a>
            </div>
  
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Se non hai richiesto il reset della password, puoi ignorare questa email. Il link scadrà tra 1 ora.
            </p>
          </div>
        `,
      });
  
      if (error) {
        console.error("❌ Resend Reset Email Error:", error);
        return;
      }
  
      console.log("📨 Reset email sent successfully. ID:", data.id);
    } catch (error) {
      console.error("❌ Unexpected Error sending Reset Email:", error);
    }
  };

module.exports = {
  sendWelcomeEmail,
  sendTicketsEmail,
  sendPasswordResetEmail
};