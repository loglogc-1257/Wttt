const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interact with You-AI',
  usage: 'gpt4 [your message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');

    // Nouveau RP : Stanley Stawa
    const RP = "Envoi des stickers correspond ";

    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }

    const fullPrompt = `${RP} : ${prompt}`;

    const apis = [
      `https://zaikyoov3-up.up.railway.app/api/perplexity-sonar-pro?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&imgs=1&system=1`,
      `https://zaikyoov3-up.up.railway.app/api/openai-gpt-4.1?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&imgs=1&system=1`,
      `https://zaikyoov3-up.up.railway.app/api/google-gemini-2.5-pro-preview?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&imgs=1&system=1`,
      `https://zaikyoov3-up.up.railway.app/api/01-ai-yi-large?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&system=1`,
      `https://api.nekorinn.my.id/ai/gemma-3-27b?text=${encodeURIComponent(fullPrompt)}`
    ];

    for (const url of apis) {
      try {
        const { data } = await axios.get(url);
        const response = data?.response || data?.result || data?.description || data?.reponse || data;

        if (response) {
          const parts = [];
          for (let i = 0; i < response.length; i += 1800) {
            parts.push(response.substring(i, i + 1800));
          }

          for (const part of parts) {
            await sendMessage(senderId, { text: part + ' 🪐' }, pageAccessToken);
          }

          return; // Réponse réussie
        }
      } catch (err) {
        console.warn(`❌ Échec de l'API : ${url} — ${err.message}`);
        continue; // On passe à l’API suivante
      }
    }

    // Aucune API n’a répondu
    await sendMessage(senderId, {
      text: "😓 Toutes les IA sont injoignables pour le moment.\nRéessaie dans quelques instants."
    }, pageAccessToken);
  }
};
