const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const token = fs.readFileSync('token.txt', 'utf8').trim();

const useFontFormatting = true; // Active ou désactive le formatage stylisé

module.exports = {
  name: 'ai',
  description: 'Interact with Free GPT - OpenAI.',
  author: 'Arn',

  async execute(senderId, args) {
    const query = args.join(" ").trim();
    if (!query) return sendStyledMessage(senderId, getDefaultMessage(), token);

    // Gestion spéciale pour "À quoi sert"
    if (query.toLowerCase().startsWith("à quoi sert")) {
      return sendStyledMessage(senderId, `🔎 *Explication :* ${await getExplanation(query)}`, token);
    }

    await handleChatResponse(senderId, query, token);
  },
};

// Fonction pour récupérer une explication rapide
const getExplanation = async (query) => {
  try {
    const apiUrl = "https://kaiz-apis.gleeze.com/api/bert-ai";
    const { data } = await axios.get(apiUrl, { params: { q: query, uid: "system" } });
    return data.response || "Je n’ai pas d’information précise à ce sujet.";
  } catch (error) {
    console.error('Erreur API:', error.message);
    return "❌ *Impossible de récupérer l'information pour le moment.*";
  }
};

// Fonction principale pour gérer la réponse IA
const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/bert-ai";

  try {
    const { data } = await axios.get(apiUrl, { params: { q: input, uid: senderId } });

    const finalMessage = `🤖 *Réponse IA*  
📌 *${data.response}*  
💡 *Pose-moi une autre question !*`;

    await sendStyledMessage(senderId, finalMessage, pageAccessToken);
  } catch (error) {
    console.error('Erreur IA:', error.message);
    await sendStyledMessage(senderId, "❌ *Erreur interne. Réessayez plus tard.*", pageAccessToken);
  }
};

// Fonction d'envoi de message optimisée
const sendStyledMessage = async (senderId, text, pageAccessToken) => {
  await sendMessage(senderId, { text: useFontFormatting ? formatResponse(text) : text }, pageAccessToken);
};

// Réduction du formatage pour accélérer l'affichage
const formatResponse = (text) => text.replace(/A/g, '𝗔').replace(/B/g, '𝗕').replace(/C/g, '𝗖');

// Message par défaut
const getDefaultMessage = () => `📌 *Veuillez entrer une question*  
🤖 𝑱𝒆 𝒔𝒖𝒊𝒔 𝒑𝒓𝒆̂𝒕 𝒂̀ 𝒗𝒐𝒖𝒔 𝒓𝒆́𝒑𝒐𝒏𝒅𝒓𝒆 !`;
