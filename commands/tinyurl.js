const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tinyurl',
  description: "Réduit une URL avec TinyURL",
  author: 'DP',
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: "Veuillez fournir une URL à raccourcir." }, pageAccessToken);
      return;
    }

    const url = args[0];
    const apiUrl = `https://kaiz-apis.gleeze.com/api/tinyurl?upload=${encodeURIComponent(url)}`;

    try {
      const { data } = await axios.get(apiUrl);
      await sendMessage(senderId, { text: `🔗 URL raccourcie : ${data.short_url}` }, pageAccessToken);
    } catch (error) {
      console.error('Erreur API TinyURL:', error);
      await sendMessage(senderId, { text: "❌ Erreur lors de la réduction de l'URL." }, pageAccessToken);
    }
  }
};
