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
    const RP = "";

    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }

    const fullPrompt = `${RP} : ${prompt}`;

    const apis = [
      {
        name: 'Perplexity',
        method: 'GET',
        url: `https://zaikyoov3-up.up.railway.app/api/perplexity-sonar-pro?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&imgs=1&system=1`
      },
      {
        name: 'Pollinations.ai',
        method: 'GET',
        url: `https://text.pollinations.ai/prompt=${encodeURIComponent(fullPrompt)}`
      },
      {
        name: 'OpenAI GPT-4.1',
        method: 'GET',
        url: `https://zaikyoov3-up.up.railway.app/api/openai-gpt-4.1?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&imgs=1&system=1`
      },
      {
        name: 'Gemini 2.5 Pro',
        method: 'GET',
        url: `https://zaikyoov3-up.up.railway.app/api/google-gemini-2.5-pro-preview?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&imgs=1&system=1`
      },
      {
        name: '01.AI Yi-Large',
        method: 'GET',
        url: `https://zaikyoov3-up.up.railway.app/api/01-ai-yi-large?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&system=1`
      },
      {
        name: 'Gemma 3 27B',
        method: 'GET',
        url: `https://api.nekorinn.my.id/ai/gemma-3-27b?text=${encodeURIComponent(fullPrompt)}`
      }
    ];

    for (const api of apis) {
      try {
        const res = await axios.get(api.url);
        const data = res.data;

        const response = data?.response ||
                         data?.result ||
                         data?.description ||
                         data?.reponse ||
                         (typeof data === 'string' ? data : null);

        if (response) {
          const parts = [];
          for (let i = 0; i < response.length; i += 1800) {
            parts.push(response.substring(i, i + 1800));
          }

          for (const part of parts) {
            await sendMessage(senderId, { text: part + ' 🪐' }, pageAccessToken);
          }

          return; // Succès → on arrête ici
        }
      } catch (err) {
        console.warn(`❌ ${api.name} a échoué : ${err.message}`);
        continue;
      }
    }

    // Aucune IA n’a répondu
    await sendMessage(senderId, {
      text: "😓 Toutes les IA sont injoignables pour le moment.\nRéessaie dans quelques instants."
