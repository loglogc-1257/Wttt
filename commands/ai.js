const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interact with You-AI',
  usage: 'gpt4 [your message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }

    try {
      const { data } = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o-pro?ask=${encodeURIComponent(prompt)}&uid=${senderId}&imageUrl=&apikey=7a8e29cc-18c8-4e69-99ef-209169503342`);

      const responseText = data.response || '';
      const imageUrl = data.images || null;

      // Découpage si réponse trop longue
      const parts = [];
      for (let i = 0; i < responseText.length; i += 1800) {
        parts.push(responseText.substring(i, i + 1800));
      }

      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }

      // Envoi du lien image en texte s'il existe
      if (imageUrl) {
        await sendMessage(senderId, {
          text: `Voici l'image générée : ${imageUrl}`
        }, pageAccessToken);
      }

    } catch (err) {
      console.error("Erreur API AI:", err.message || err);
      sendMessage(senderId, {
        text: "🤖 Oups ! Une petite erreur est survenue.\n\n" +
              "❓ Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }
  }
};
