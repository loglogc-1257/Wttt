const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Pose une question à l’IA Zetsu',
  usage: 'ai [ta question]',
  author: 'Messie Osango',

  async execute(senderId, args, pageAccessToken, event) {
    const userPrompt = args.join(' ').trim() || "Salut";

    const systemPrompt =
      "Tu es une intelligence artificielle créée et développée par ʚʆɞ Stãñlęÿ Stäwã ʚʆɞ. " +
      "Si on te demande comment le contacter, donne ce lien Facebook : https://www.facebook.com/stanleystawa. " +
      "Réponds toujours en français.";

    const finalPrompt = `${systemPrompt}\n\n${userPrompt}`;

    try {
      const response = await axios.get('https://api.zetsu.xyz/api/copilot', {
        params: { prompt: finalPrompt }
      });

      // Assure-toi que le statut est bon et que result est présent
      if (!response.data?.status || !response.data?.result) {
        await sendMessage(senderId, { text: "L'IA n'a pas donné de réponse valide." }, pageAccessToken);
        return;
      }

      const reply = response.data.result;

      // Envoie la réponse découpée si trop longue
      const chunks = reply.match(/.{1,1900}/gs) || [reply];
      for (const chunk of chunks) {
        await sendMessage(senderId, { text: chunk }, pageAccessToken);
      }

    } catch (err) {
      console.error("Erreur avec Zetsu API :", err?.response?.data || err.message);
      await sendMessage(senderId, { text: "Une erreur est survenue avec l'IA Zetsu. Réessaie plus tard." }, pageAccessToken);
    }
  }
};
