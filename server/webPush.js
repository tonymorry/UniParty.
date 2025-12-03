const webPush = require('web-push');

// Configuration
// In production, these should be in environment variables
let publicVapidKey = process.env.VAPID_PUBLIC_KEY;
let privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (!publicVapidKey || !privateVapidKey) {
  console.log("⚠️ VAPID Keys not found in ENV. Generating temporary keys...");
  const vapidKeys = webPush.generateVAPIDKeys();
  publicVapidKey = vapidKeys.publicKey;
  privateVapidKey = vapidKeys.privateKey;
  console.log("---------------------------------------------------");
  console.log("Paste these in your .env file to persist subscriptions:");
  console.log(`VAPID_PUBLIC_KEY=${publicVapidKey}`);
  console.log(`VAPID_PRIVATE_KEY=${privateVapidKey}`);
  console.log("---------------------------------------------------");
}

webPush.setVapidDetails(
  'mailto:uniparty.team@gmail.com',
  publicVapidKey,
  privateVapidKey
);

const sendPushNotification = async (subscription, payload) => {
  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error("Error sending push notification", err);
    return false;
  }
};

module.exports = {
  webPush,
  publicVapidKey,
  sendPushNotification
};