const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const getImageUrl = async (event, token) => {
  const mid = event?.message?.reply_to?.mid || event?.message?.mid;
  if (!mid) return null;

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v22.0/${mid}/attachments`, {
      params: { access_token: token }
    });

    const imageUrl = data?.data?.[0]?.image_data?.url || data?.data?.[0]?.file_url || null;
    return imageUrl;
  } catch (err) {
    console.error("Image URL fetch error:", err?.response?.data || err.message);
    return null;
  }
};

const conversationHistory = {};

module.exports = {
  name: 'ai',
  description: 'Interact with Mocha AI using text queries and image analysis',
  usage: 'ask a question, or send a reply question to an image.',
  author: 'Messie Osango',

  async execute(senderId, args, pageAccessToken, event) {
    let prompt = args.join(' ').trim() || 'Hello';

    const systemPrompt = 
      "Tu es une intelligence artificielle créée et développée par ʚʆɞ Stãñlęÿ Stäwã ʚʆɞ et dans le cas où tu constate qu on te demande un moyen pour le contacté son lien ou comment le rejoindre tu peux utiliser ce lien Facebook dans ta réponse , tu ne dois envoyer le lien que quand tu sent qu'on te demande comment le contacter  https://www.facebook.com/stanleystawa'";
    
    prompt = systemPrompt + " Réponds toujours en français. " + prompt;

    try {
      if (!conversationHistory[senderId]) {
        conversationHistory[senderId] = [];
      }

      conversationHistory[senderId].push({ role: 'user', content: prompt });

      const chunkMessage = (message, maxLength) => {
        const chunks = [];
        for (let i = 0; i < message.length; i += maxLength) {
          chunks.push(message.slice(i, i + maxLength));
        }
        return chunks;
      };

      const imageUrl = await getImageUrl(event, pageAccessToken);

      if (imageUrl) {
        prompt += `\nImage URL: ${imageUrl}`;
      }

      const encodedPrompt = encodeURIComponent(prompt);
      const { data } = await axios.get(`https://api.zetsu.xyz/api/copilot?prompt=${encodedPrompt}`);

      const fullResponseText = data?.result || data?.response || data;

      if (!fullResponseText) {
        throw new Error('Réponse vide de l’IA.');
      }

      conversationHistory[senderId].push({ role: 'assistant', content: fullResponseText });

      const messageChunks = chunkMessage(fullResponseText, 1900);
      for (const chunk of messageChunks) {
        await sendMessage(senderId, { text: chunk }, pageAccessToken);
      }

    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.error("Bad Request: Ignored.");
      } else {
        console.error("Error:", err);
        await sendMessage(senderId, { text: "Oups , 🎃🚬 une erreur s'est produite. " }, pageAccessToken);
      }
    }
  },
};
