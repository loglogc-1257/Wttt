const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const userHistory = {};

module.exports = {
  name: 'ai',
  description: 'Interact with You-AI',
  usage: 'gpt4 [your message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    const RP = "";

    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }

    if (!userHistory[senderId]) userHistory[senderId] = [];
    userHistory[senderId].push(`User: ${prompt}`);
    if (userHistory[senderId].length > 6) {
      userHistory[senderId] = userHistory[senderId].slice(-6);
    }

    const fullPrompt = `${RP}\n${userHistory[senderId].join('\n')}`;

    const urls = [
      `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`,
      `https://mybot-rest.kozow.com/api/gemini?ask=${encodeURIComponent(fullPrompt)}`,
      `https://mybot-rest.kozow.com/api/gemini-2.5-flash?ask=${encodeURIComponent(fullPrompt)}`,
      `https://zaikyoov3-up.up.railway.app/api/perplexity-sonar-pro?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&imgs=1&system=1`,
      `https://zaikyoov3-up.up.railway.app/api/01-ai-yi-large?prompt=${encodeURIComponent(fullPrompt)}&uid=${senderId}&system=1`,
      `https://api.nekorinn.my.id/ai/gemma-3-27b?text=${encodeURIComponent(fullPrompt)}`
    ];

    const fetchWithTimeout = (url, timeout = 10000) => {
      return axios.get(url, { timeout }).then(({ data }) => {
        const response = typeof data === 'string'
          ? data
          : (data?.response || data?.result || data?.description || data?.reponse || data);
        if (response && typeof response === 'string' && response.trim().length > 0) {
          return response.trim();
        }
        throw new Error('Réponse vide');
      }).catch(() => null); // éviter les erreurs bloquantes
    };

    // Lancer toutes les requêtes simultanément
    const allRequests = urls.map(url => fetchWithTimeout(url, 10000));

    let response = null;

    // Étape 1 : attendre jusqu’à 5 secondes pour la première réponse
    try {
      response = await Promise.any(
        allRequests.map(p => Promise.race([
          p,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]))
      );
    } catch (_) {
      // aucune réponse en 5 sec
    }

    // Étape 2 : si rien reçu, attendre jusqu'à 5 secondes supplémentaires
    if (!response) {
      try {
        response = await Promise.any(allRequests); // déjà lancées
      } catch (_) {
        // toujours rien
      }
    }

    if (response) {
      userHistory[senderId].push(`AI: ${response}`);
      if (userHistory[senderId].length > 6) {
        userHistory[senderId] = userHistory[senderId].slice(-6);
      }

      const parts = [];
      for (let i = 0; i < response.length; i += 1800) {
        parts.push(response.substring(i, i + 1800));
      }

      for (const part of parts) {
        await sendMessage(senderId, { text: part + ' 🪐' }, pageAccessToken);
      }
    } else {
      console.warn("❌ Aucune API n'a répondu dans les 10 secondes.");
      await sendMessage(senderId, {
        text: "😓 Toutes les IA sont injoignables ou ont mis trop de temps.\nRéessaie dans quelques instants."
      }, pageAccessToken);
    }
  }
};
