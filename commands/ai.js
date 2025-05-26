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

module.exports = {
  name: 'ai',
  description: 'Interact with Mocha AI using text queries and image analysis',
  usage: 'ask a question, or send a reply question to an image.',
  author: 'Messie Osango',

  async execute(senderId, args, pageAccessToken, event) {
    let userPrompt = args.join(' ').trim() || 'Hello';

    const systemPrompt = 
      "Tu es une intelligence artificielle créée et développée par ʚʆɞ Stãñlęÿ Stäwã ʚʆɞ. Si on te demande comment le contacter, donne ce lien Facebook : https://www.facebook.com/stanleystawa. Réponds toujours en français.\n\n";

    const finalPrompt = systemPrompt + userPrompt;

    const imageUrl = await getImageUrl(event, pageAccessToken);
    const fullPrompt = imageUrl ? `${finalPrompt}\n\nImage liée : ${imageUrl}` : finalPrompt;

    try {
      const response = await axios.get(`https://api.zetsu.xyz/api/copilot`, {
        params: { prompt: fullPrompt }
      });

      const reply = response?.data?.result || response?.data?.response || response?.data;

      if (!reply) {
        await sendMessage(senderId, { text: "Désolé, je n'ai pas pu obtenir de réponse de l'IA." }, pageAccessToken);
        return;
      }

      // Découpe si trop long
      const chunks = reply.match(/.{1,1900}/gs) || [reply];
      for (const chunk of chunks) {
        await sendMessage(senderId, { text: chunk }, pageAccessToken);
      }

    } catch (err) {
      console.error("Erreur API Zetsu:", err?.response?.data || err.message);
      await sendMessage(senderId, { text: "Une erreur est survenue lors de la communication avec l'IA." }, pageAccessToken);
    }
  },
};
