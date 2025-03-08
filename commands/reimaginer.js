const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'reimagine',
  description: "Modifie une image existante avec l'IA",
  author: 'DP',
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: "Veuillez fournir l'URL d'une image à modifier." }, pageAccessToken);
      return;
    }

    const imageUrl = args[0];
    const apiUrl = `https://kaiz-apis.gleeze.com/api/reimagine?url=${encodeURIComponent(imageUrl)}`;

    try {
      const { data } = await axios.get(apiUrl);
      await sendMessage(senderId, { text: `🔄 Image modifiée : ${data.url}` }, pageAccessToken);
    } catch (error) {
      console.error('Erreur API Reimagine:', error);
      await sendMessage(senderId, { text: "❌ Erreur lors de la modification de l'image." }, pageAccessToken);
    }
  }
};
