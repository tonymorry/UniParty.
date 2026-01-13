const { User } = require('./models');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

/**
 * Invia una notifica push tramite OneSignal a un utente specifico
 * @param {String} userId - ID dell'utente nel database MongoDB
 * @param {String} title - Titolo della notifica
 * @param {String} message - Messaggio della notifica
 * @param {String} url - URL opzionale da aprire al click
 */
const sendPushNotification = async (userId, title, message, url = '/') => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.oneSignalPlayerId) {
      console.log(`⚠️ Notifica non inviata: Utente ${userId} non ha un playerId OneSignal registrato.`);
      return false;
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [user.oneSignalPlayerId],
        headings: { "en": title, "it": title },
        contents: { "en": message, "it": message },
        url: url
      })
    });

    const data = await response.json();
    if (data.errors) {
      console.error("❌ Errore API OneSignal:", data.errors);
      return false;
    }

    console.log(`✅ Notifica OneSignal inviata a ${user.email}`);
    return true;
  } catch (err) {
    console.error("❌ Errore durante l'invio della notifica OneSignal:", err);
    return false;
  }
};

module.exports = {
  sendPushNotification
};