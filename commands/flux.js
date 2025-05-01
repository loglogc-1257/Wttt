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
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

    if (apiUrl.length > 2000) {
      await sendMessage(senderId, {
        text: '❌ Votre description est trop longue. Essayez de la raccourcir.'
      }, pageAccessToken);
      return;
    }

    await sendMessage(senderId, { text: '♻️ Génération de l’image en cours...' }, pageAccessToken);

    try {
      // Vérifie que l'image est bien générée avant de l'envoyer
      await axios.get(apiUrl, { responseType: 'arraybuffer' });

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: apiUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Erreur API Pollinations:', error);
      await sendMessage(senderId, {
        text: "❌ Erreur lors de la génération de l’image. Essayez un prompt plus court ou différent."
      }, pageAccessToken);
    }
  }
};
