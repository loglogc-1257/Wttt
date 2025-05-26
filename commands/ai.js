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

    try {
      if (!conversationHistory[senderId]) {
        conversationHistory[senderId] = [];
      }

      conversationHistory[senderId].push({ role: 'user', content: prompt });

      if (conversationHistory[senderId].length > 10) {
        conversationHistory[senderId] = conversationHistory[senderId].slice(-10);
      }

      let combinedPrompt = conversationHistory[senderId]
        .map(msg => (msg.role === 'user' ? 'Utilisateur: ' : 'Assistant: ') + msg.content)
        .join('\n') + '\nAssistant:';

      const imageUrl = await getImageUrl(event, pageAccessToken);
      if (imageUrl) {
        combinedPrompt += `\n[Image URL: ${imageUrl}]`;
      }

      let responseText;

      try {
        // Zetsu
        const encodedPrompt = encodeURIComponent(combinedPrompt);
        const zetsuResponse = await axios.get(`https://api.zetsu.xyz/api/copilot`, {
          params: {
            prompt: encodedPrompt,
            apikey: 'dfc3db8eeb9991ebed1880d4b153625f'
          }
        });

        responseText = zetsuResponse.data?.result || zetsuResponse.data?.response;

        if (!responseText) throw new Error("Zetsu a répondu vide.");
      } catch (zetsuError) {
        console.warn("Zetsu indisponible. Bascule vers Gemini...");

        // Gemini fallback
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDIGG4puPZ6kPIUR0CSD6fOgh6PNWqYFuM`,
          {
            contents: [
              {
                parts: [{ text: combinedPrompt }],
                role: 'user'
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        responseText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) throw new Error("Réponse vide de Gemini.");
      }

      conversationHistory[senderId].push({ role: 'assistant', content: responseText });

      const chunkMessage = (message, maxLength) => {
        const chunks = [];
        for (let i = 0; i < message.length; i += maxLength) {
          chunks.push(message.slice(i, i + maxLength));
        }
        return chunks;
      };

      const messageChunks = chunkMessage(responseText, 1900);
      for (const chunk of messageChunks) {
        await sendMessage(senderId, { text: chunk }, pageAccessToken);
      }

    } catch (err) {
      console.error("Erreur finale:", err?.response?.data || err.message);
      await sendMessage(senderId, { text: "Les deux IA sont inaccessibles pour le moment." }, pageAccessToken);
    }
  },
};
