const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const token = fs.readFileSync('token.txt', 'utf8').trim();

// Activation du formatage de texte stylisé (true = activé, false = désactivé)
const useFontFormatting = true;

module.exports = {
  name: 'ai',
  description: 'Interact with Free GPT - OpenAI.',
  author: 'Arn',

  async execute(senderId, args) {
    const query = args.join(" ").toLowerCase().trim();
    if (!query) return sendStyledMessage(senderId, getDefaultMessage(), token);

    if (["sino creator mo?", "who created you?"].includes(query)) {
      return sendStyledMessage(senderId, "Stanley stawa ", token);
    }

    await handleChatResponse(senderId, query, token);
  },
};

// Fonction principale pour gérer la réponse de l'IA
const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/bert-ai";

  try {
    // Message d'attente stylisé
    await sendStyledMessage(senderId, "🤖 Mon cerveau d’IA turbine à plein régime ! Attendez un instant...", pageAccessToken);
    
    const { data } = await axios.get(apiUrl, { params: { q: input, uid: senderId } });
    const response = data.response;

    // Réponse stylisée avec un effet unique
    const finalMessage = `
╔════════════════════╗
  🎙️ *Réponse de l'IA Mickey * 🎙️
╚════════════════════╝

💡 *${response}* 💡

✨ Posez-moi une autre question ! ✨`;

    await sendStyledMessage(senderId, finalMessage, pageAccessToken);
  } catch (error) {
    console.error('Erreur lors de la récupération de la réponse IA:', error.message);
    await sendStyledMessage(senderId, "❌ Oups, une erreur s'est produite.", pageAccessToken);
  }
};

// Fonction d'envoi de message avec style
const sendStyledMessage = async (senderId, text, pageAccessToken) => {
  const formattedText = useFontFormatting ? formatResponse(text) : text;
  await sendMessage(senderId, { text: formattedText }, pageAccessToken);
};

// Formatage des messages avec des polices spéciales
const formatResponse = (text) => {
  const fontMap = {
    'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': '𝑒', 'f': '𝒻', 'g': '𝑔', 'h': '𝒽',
    'i': '𝒾', 'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': '𝑜', 'p': '𝓅', 'q': '𝓆',
    'r': '𝓇', 's': '𝓈', 't': '𝓉', 'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏',
    'A': '𝒜', 'B': '𝐵', 'C': '𝒞', 'D': '𝒟', 'E': '𝐸', 'F': '𝐹', 'G': '𝒢', 'H': '𝐻',
    'I': '𝐼', 'J': '𝒥', 'K': '𝒦', 'L': '𝐿', 'M': '𝑀', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬',
    'R': '𝑅', 'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵'
  };
  
  return text.split('').map(char => fontMap[char] || char).join('');
};

// Message par défaut si aucune requête n'est fournie
const getDefaultMessage = () => `
⛷ 𝙅𝒆 𝒗𝒐𝒖𝒔 𝒑𝒓𝒊𝒆 ძe me ⍴résen𝗍er 𝒍𝒂 𝒒𝒖𝒆𝒔𝒕𝒊𝒐𝒏 𝙨𝙚𝙡𝙤𝙣 𝙫𝙤𝙩𝙧𝙚 préférence⚜,
𝙚𝙩 𝙟𝙚 𝙢'𝙚𝙢𝙥𝙡𝙤𝙞𝙚𝙧𝙖𝙞 à 𝕧𝕠𝕦𝕤 𝕠𝕗𝕗𝕣𝕚𝕣 𝕦𝕟𝕖 réponse 𝕡𝕖𝕣𝕥𝕚𝕟𝕖𝕟𝕥𝕖 𝕖𝕥 adéquate. ❤  
𝐒𝐚𝐜𝐡𝐞𝐳 𝐪𝐮𝐞 𝐯𝐨𝐭𝐫𝐞 𝐬𝐚𝐭𝐢𝐬𝐟𝐚𝐜𝐭𝐢𝐨𝐧 𝐝𝐞𝐦𝐞𝐮𝐫𝐞 𝐦𝐚 𝐩𝐫𝐢𝐨𝐫𝐢𝐭é à 𝐭𝐨𝐮𝐭𝐞𝐬 é𝐠𝐚𝐫𝐝𝐬 😉.  
(merci pour votre attention)
`;
