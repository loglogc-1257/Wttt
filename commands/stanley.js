const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const stanleyUsers = new Set();

module.exports = {
  name: 'stanley',
  description: 'Active le mode Stanley pour humaniser les messages.',
  usage: 'stanley / stanley off / message',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const message = args.join(' ').trim().toLowerCase();

    // Activation
    if (message === 'stanley' || message === 'on') {
      stanleyUsers.add(senderId);
      return sendMessage(senderId, {
        text: "Stanley est activé. Tous vos messages seront humanisés."
      }, pageAccessToken);
    }

    // Désactivation
    if (message === 'stanley off' || message === 'off') {
      stanleyUsers.delete(senderId);
      return; // Pas de réponse
    }

    // Traitement si Stanley actif
    if (stanleyUsers.has(senderId)) {
      try {
        const { data } = await axios.get(`https://kaiz-apis.gleeze.com/api/humanizer?q=${encodeURIComponent(args.join(' '))}`);
        return sendMessage(senderId, { text: data.response }, pageAccessToken);
      } catch {
        return sendMessage(senderId, {
          text: "🤖 Une erreur est survenue avec Stanley. Réessaie plus tard."
        }, pageAccessToken);
      }
    }

    // Si Stanley désactivé → ne rien envoyer
    return;
  }
};
