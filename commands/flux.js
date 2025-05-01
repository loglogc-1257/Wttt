const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'flux',
  description: "Génère une image avec Pollinations",
  usage: 'flux [prompt]',
  author: 'Stanley',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: '❌ Veuillez fournir une description.\n\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: flux un jardin paisible avec des abeilles.'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(" ");
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    await sendMessage(senderId, { text: '♻️ Génération de l’image en cours...' }, pageAccessToken);

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: apiUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Erreur API Pollinations:', error);
      await sendMessage(senderId, {
        text: "❌ Erreur lors de la génération de l’image."
      }, pageAccessToken);
    }
  }
};