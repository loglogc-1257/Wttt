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

async function sendTypingIndicator(senderId, pageAccessToken) {
  try {
    const res = await sendMessage(senderId, { text: "✍️ L’IA écrit..." }, pageAccessToken);
    return res?.message_id || null;
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'indicateur :", err.message);
    return null;
  }
}

async function deleteMessage(messageId, pageAccessToken) {
  try {
    if (messageId) {
      await axios.delete(`https://graph.facebook.com/v19.0/${messageId}`, {
        params: { access_token: pageAccessToken }
      });
    }
  } catch (err) {
    console.error("Erreur lors de la suppression du message :", err.message);
  }
}

module.exports = {
  name: 'ai',
  description: 'Interact with Mocha AI using text queries and image analysis',
  usage: 'ask a question, or send a reply question to an image.',
  author: 'Messie Osango',

  async execute(senderId, args, pageAccessToken, event) {
    let prompt = args.join(' ').trim() || 'Hello';
    const uid = senderId;
    const imageUrl = await getImageUrl(event, pageAccessToken);
    if (imageUrl) {
      prompt += `\nImage URL: ${imageUrl}`;
    }

    if (!conversationHistory[uid]) {
      conversationHistory[uid] = [];
    }

    conversationHistory[uid].push({ role: 'user', content: prompt });

    const chunkMessage = (message, maxLength) => {
      const chunks = [];
      for (let i = 0; i < message.length; i += maxLength) {
        chunks.push(message.slice(i, i + maxLength));
      }
      return chunks;
    };

    const typingMessageId = await sendTypingIndicator(senderId, pageAccessToken);

    try {
      // Essai avec Zetsu
      const zetsuRes = await axios.get('https://api.zetsu.xyz/api/copilot', {
        params: {
          prompt: encodeURIComponent(prompt),
          apikey: 'dfc3db8eeb9991ebed1880d4b153625f'
        }
      });

      await deleteMessage(typingMessageId, pageAccessToken);

      const reply = zetsuRes.data?.result || zetsuRes.data?.response;
      if (!reply) throw new Error("Réponse vide de Zetsu");

      conversationHistory[uid].push({ role: 'assistant', content: reply });

      const chunks = chunkMessage(reply, 1900);
      for (const chunk of chunks) {
        await sendMessage(senderId, { text: chunk }, pageAccessToken);
      }
    } catch (zetsuErr) {
      console.warn("Zetsu a échoué, tentative avec Gemini...");
      try {
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDIGG4puPZ6kPIUR0CSD6fOgh6PNWqYFuM`,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        await deleteMessage(typingMessageId, pageAccessToken);

        const geminiReply = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!geminiReply) throw new Error("Réponse vide de Gemini");

        conversationHistory[uid].push({ role: 'assistant', content: geminiReply });

        const chunks = chunkMessage(geminiReply, 1900);
        for (const chunk of chunks) {
          await sendMessage(senderId, { text: chunk }, pageAccessToken);
        }
      } catch (geminiErr) {
        console.error("Erreur Gemini:", geminiErr.message);
        await deleteMessage(typingMessageId, pageAccessToken);
        await sendMessage(senderId, { text: "Oups, 🎃🚬 une erreur s'est produite avec les deux IA." }, pageAccessToken);
      }
    }
  },
};
