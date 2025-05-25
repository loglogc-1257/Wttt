// activityMonitor.js
const { sendMessage } = require('./handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8').trim();
const activityLog = {}; // { [userId]: timestamp }

const ONE_MINUTE = 60 * 1000;

module.exports = {
  recordActivity(userId) {
    activityLog[userId] = Date.now();
  },

  startInactivityWatcher() {
    setInterval(async () => {
      const now = Date.now();
      for (const userId in activityLog) {
        if (now - activityLog[userId] >= ONE_MINUTE) {
          try {
            await sendMessage(
              userId,
              { text: 'Tu es resté inactif·ve depuis 1 minute. Reviens discuter avec moi !' },
              token
            );
            activityLog[userId] = now; // éviter les spams
          } catch (err) {
            console.error(`Erreur en notifiant ${userId}:`, err);
          }
        }
      }
    }, ONE_MINUTE);
  }
};
