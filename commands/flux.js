const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'flux',
  description: "Génère une image avec Flux",
  author: 'DP',
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: "Veuillez fournir une description pour générer une image." }, pageAccessToken);
      return;
    }

    const prompt = args.join(" ");
    const apiUrl = `https://kaiz-apis.gleeze.com/api/flux?prompt=${encodeURIComponent(prompt)}`;

    try {
      const { data } = await axios.get(apiUrl);
      await sendMessage(senderId, { attachment: { type: 'image', payload: { url: data.image_url } } }, pageAccessToken);
    } catch (error) {
      console.error('Erreur API Flux:', error);
      await sendMessage(senderId, { text: "❌ Erreur lors de la génération de l'image." }, pageAccessToken);
    }
  }
};
