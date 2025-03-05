const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8').trim();
const chatHistory = {}; // Objet pour stocker l'historique des conversations par utilisateur

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

  // Initialiser l'historique si l'utilisateur est nouveau
  if (!chatHistory[senderId]) {
    chatHistory[senderId] = [];
  }

  // Ajouter la question à l'historique
  chatHistory[senderId].push({ role: "user", message: input });

  try {
    // Envoyer l'historique avec la nouvelle question pour conserver le contexte
    const { data } = await axios.get(apiUrl, { 
      params: { 
        q: input, 
        uid: senderId, 
        history: JSON.stringify(chatHistory[senderId]) 
      } 
    });

    const response = data.response;

    // Ajouter la réponse de l'IA à l'historique
    chatHistory[senderId].push({ role: "ai", message: response });

    await sendLongMessage(senderId, response, pageAccessToken);
  } catch (error) {
    console.error('Erreur AI:', error.message);
    await sendMessage(senderId, { text: "⚠️ Veuillez patienter un instant !" }, pageAccessToken);
  }
};

// Fonction pour gérer les messages longs tout en respectant l'ordre
const sendLongMessage = async (senderId, message, pageAccessToken) => {
  const maxLength = 9000; // Longueur maximale par message
  let parts = [];

  for (let i = 0; i < message.length; i += maxLength) {
    parts.push(message.substring(i, i + maxLength));
  }

  for (let i = 0; i < parts.length; i++) {
    await sendMessage(senderId, { text: parts[i] }, pageAccessToken);
    await new Promise(resolve => setTimeout(resolve, 500)); // Pause de 500ms entre chaque envoi
  }
};
                              
