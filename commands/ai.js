const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8').trim();

module.exports = {
  name: 'ai',
  description: 'Interagissez avec Orochi AI.',
  author: 'Arn & coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(" ").trim();

    if (!query) {
      const defaultMessage = 
        "✨ Bonjour et bienvenue ! " +
        "Posez-moi vos questions 🤖 " +
        "\n\nVotre satisfaction est ma priorité ! 🚀\n\n_(Édité par Stanley Stawa)_";

      return await sendMessage(senderId, { text: defaultMessage }, pageAccessToken);
    }

    if (["sino creator mo?", "qui t'a créé ?"].includes(query.toLowerCase())) {
      return await sendMessage(senderId, { text: "Stanley Stawa" }, pageAccessToken);
    }

    await handleChatResponse(senderId, query, pageAccessToken);
  },
};

const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/bert-ai";

  try {
    const { data } = await axios.get(apiUrl, { params: { q: input, uid: senderId } });
    const response = data.response;

    await sendLongMessage(senderId, response, pageAccessToken);
  } catch (error) {
    console.error('Erreur AI:', error.message);
    await sendMessage(senderId, { text: "⚠️ Veuillez patienter un instant !" }, pageAccessToken);
  }
};

// Fonction pour gérer les messages trop longs
const sendLongMessage = async (senderId, message, pageAccessToken) => {
  const maxLength = 600; // Définir la longueur maximale par message
  let parts = [];

  for (let i = 0; i < message.length; i += maxLength) {
    parts.push(message.substring(i, i + maxLength));
  }

  for (const part of parts) {
    await sendMessage(senderId, { text: part }, pageAccessToken);
  }
};
