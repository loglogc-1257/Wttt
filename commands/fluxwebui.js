const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fluxwebui',
  description: "Génère une image avec Flux WebUI",
  author: 'DP',
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length < 2) {
      await sendMessage(senderId, { text: "Veuillez fournir une description et un ratio." }, pageAccessToken);
      return;
    }

    const prompt = args.slice(0, -1).join(" ");
    const ratio = args[args.length - 1];
    const apiUrl = `https://kaiz-apis.gleeze.com/api/fluxwebui?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`;

    try {
      const { data } = await axios.get(apiUrl);
      await sendMessage(senderId, { attachment: { type: 'image', payload: { url: data.image_url } } }, pageAccessToken);
    } catch (error) {
      console.error('Erreur API Flux WebUI:', error);
      await sendMessage(senderId, { text: "❌ Erreur lors de la génération de l'image." }, pageAccessToken);
    }
  }
};
