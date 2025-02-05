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
      return sendStyledMessage(senderId, "👤 *Créateur :* 𝗔𝗿𝗻 / 𝗥𝘆𝗻𝘅 𝗚𝗮𝗶𝘀𝗲𝗿", token);
    }

    await handleChatResponse(senderId, query, token);
  },
};

// Fonction principale pour gérer la réponse de l'IA
const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/bert-ai";

  try {
    // Message d'attente stylisé
    await sendStyledMessage(senderId, "⏳ *Analyse en cours...* 𝑼𝒏𝒆 𝒊𝒏𝒕𝒆𝒍𝒍𝒊𝒈𝒆𝒏𝒄𝒆 𝒂𝒓𝒕𝒊𝒇𝒊𝒄𝒊𝒆𝒍𝒍𝒆 𝒓𝒆́𝒇𝒍𝒆́𝒄𝒉𝒊𝒕 𝒂𝒖𝒔𝒔𝒊 !", pageAccessToken);
    
    const { data } = await axios.get(apiUrl, { params: { q: input, uid: senderId } });
    const response = data.response;

    // Réponse stylisée avec un cadre élégant
    const finalMessage = `
╭───────────✧  
│ 🤖 *Réponse IA*  
╰───────────✧  

📌 𝗦𝗼𝗹𝘂𝘁𝗶𝗼𝗻 :  
➜ *${response}*  

💡 *Besoin d’une autre réponse ? Posez-moi votre question !*`;

    await sendStyledMessage(senderId, finalMessage, pageAccessToken);
  } catch (error) {
    console.error('Erreur lors de la récupération de la réponse IA:', error.message);
    await sendStyledMessage(senderId, "❌ *Oups, une erreur s'est produite. Veuillez réessayer plus tard.*", pageAccessToken);
  }
};

// Fonction d'envoi de message avec style
const sendStyledMessage = async (senderId, text, pageAccessToken) => {
  const formattedText = useFontFormatting ? formatResponse(text) : text;
  await sendMessage(senderId, { text: formattedText }, pageAccessToken);
};

// Formatage des messages pour plus de visibilité et de raffinement
const formatResponse = (text) => {
  return text
    .replace(/a/g, '𝐚')
    .replace(/b/g, '𝐛')
    .replace(/c/g, '𝐜')
    .replace(/d/g, '𝐝')
    .replace(/e/g, '𝐞')
    .replace(/f/g, '𝐟')
    .replace(/g/g, '𝐠')
    .replace(/h/g, '𝐡')
    .replace(/i/g, '𝐢')
    .replace(/j/g, '𝐣')
    .replace(/k/g, '𝐤')
    .replace(/l/g, '𝐥')
    .replace(/m/g, '𝐦')
    .replace(/n/g, '𝐧')
    .replace(/o/g, '𝐨')
    .replace(/p/g, '𝐩')
    .replace(/q/g, '𝐪')
    .replace(/r/g, '𝐫')
    .replace(/s/g, '𝐬')
    .replace(/t/g, '𝐭')
    .replace(/u/g, '𝐮')
    .replace(/v/g, '𝐯')
    .replace(/w/g, '𝐰')
    .replace(/x/g, '𝐱')
    .replace(/y/g, '𝐲')
    .replace(/z/g, '𝐳')
    .replace(/A/g, '𝐀')
    .replace(/B/g, '𝐁')
    .replace(/C/g, '𝐂')
    .replace(/D/g, '𝐃')
    .replace(/E/g, '𝐄')
    .replace(/F/g, '𝐅')
    .replace(/G/g, '𝐆')
    .replace(/H/g, '𝐇')
    .replace(/I/g, '𝐈')
    .replace(/J/g, '𝐉')
    .replace(/K/g, '𝐊')
    .replace(/L/g, '𝐋')
    .replace(/M/g, '𝐌')
    .replace(/N/g, '𝐍')
    .replace(/O/g, '𝐎')
    .replace(/P/g, '𝐏')
    .replace(/Q/g, '𝐐')
    .replace(/R/g, '𝐑')
    .replace(/S/g, '𝐒')
    .replace(/T/g, '𝐓')
    .replace(/U/g, '𝐔')
    .replace(/V/g, '𝐕')
    .replace(/W/g, '𝐖')
    .replace(/X/g, '𝐗')
    .replace(/Y/g, '𝐘')
    .replace(/Z/g, '𝐙');
};

// Message par défaut si aucune requête n'est fournie
const getDefaultMessage = () => `
📌 *Veuillez entrer une question*  
🤖 𝑱𝒆 𝒔𝒖𝒊𝒔 𝒑𝒓𝒆̂𝒕 𝒂̀ 𝒗𝒐𝒖𝒔 𝒓𝒆́𝒑𝒐𝒏𝒅𝒓𝒆 !`;
