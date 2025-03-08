const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ocr',
  description: "Extrait le texte d'une image",
  author: 'DP',
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: "Veuillez fournir l'URL d'une image pour l'OCR." }, pageAccessToken);
      return;
    }

    const imageUrl = args[0];
    const apiUrl = `https://kaiz-apis.gleeze.com/api/ocr?url=${encodeURIComponent(imageUrl)}`;

    try {
      const { data } = await axios.get(apiUrl);
      await sendMessage(senderId, { text: `📜 Texte extrait :\n${data.text}` }, pageAccessToken);
    } catch (error) {
      console.error('Erreur API OCR:', error);
      await sendMessage(senderId, { text: "❌ Erreur lors de l'extraction du texte." }, pageAccessToken);
    }
  }
};
