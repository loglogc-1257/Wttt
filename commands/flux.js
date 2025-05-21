const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'flux',
  description: "Génère une image avec Flux",
  usage: 'flux [prompt]',
  author: 'Stanley',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: '❌ Veuillez fournir une description.\n\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: flux un dragon rouge.'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(" ");
    const apiUrl = `https://kaiz-apis.gleeze.com/api/stable-diffusion-3.5-rev2?prompt=${encodeURIComponent(prompt)}&apikey=7a8e29cc-18c8-4e69-99ef-209169503342`;

    await sendMessage(senderId, { text: '♻️ Génération en cours...' }, pageAccessToken);

    try {
      const response = await axios.get(apiUrl);
      const imageUrl = response.data.url || apiUrl; // Fallback au cas où l'API retourne directement l'image

      await sendMessage(senderId, {
        attachment: { type: 'image', payload: { url: imageUrl } }
      }, pageAccessToken);
    } catch (error) {
      console.error('Erreur API Flux:', error);
      await sendMessage(senderId, { text: "❌ Erreur lors de la génération de l’image." }, pageAccessToken);
    }
  }
};
