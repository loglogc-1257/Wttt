const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imgur',
  description: "Upload une image sur Imgur",
  author: 'DP',
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: "Veuillez fournir l'URL d'une image à uploader." }, pageAccessToken);
      return;
    }

    const imageUrl = args[0];
    const apiUrl = `https://kaiz-apis.gleeze.com/api/imgur?url=${encodeURIComponent(imageUrl)}`;

    try {
      const { data } = await axios.get(apiUrl);
      await sendMessage(senderId, { text: `✅ Image uploadée : ${data.url}` }, pageAccessToken);
    } catch (error) {
      console.error('Erreur API Imgur:', error);
      await sendMessage(senderId, { text: "❌ Erreur lors de l'upload de l'image." }, pageAccessToken);
    }
  }
};
