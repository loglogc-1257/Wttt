const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 's',
  description: 'Utilise Humanizer si la question commence par S',
  usage: 'S [votre message]',
  author: 'coffe',

  async execute(senderId, args, pageAccessToken) {
    const fullMessage = args.join(' ').trim();

    // Si le message commence par "S ", alors utilise l'API Humanizer
    if (/^s\s+/i.test(fullMessage)) {
      const question = fullMessage.replace(/^s\s+/i, ''); // supprime le S et l’espace

      try {
        const { data } = await axios.get(`https://kaiz-apis.gleeze.com/api/humanizer?q=${encodeURIComponent(question)}`);
        return sendMessage(senderId, { text: data.response }, pageAccessToken);
      } catch {
        return sendMessage(senderId, {
          text: "🤖 Une erreur est survenue avec Humanizer. Réessaie plus tard."
        }, pageAccessToken);
      }
    }

    // Sinon : ne rien faire ou laisser passer à d'autres commandes
    return;
  }
};
