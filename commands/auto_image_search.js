const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const tokenPath = './token.txt';
const pageAccessToken = fs.readFileSync(tokenPath, 'utf8').trim();

module.exports = {
  name: 'auto_image_search',  // Nom pour identifier la fonction
  description: 'Automatically search images for every message received.',
  author: 'coffee',

  async execute(senderId, message) {
    // Vérification si le message est vide ou non défini
    if (!message || typeof message !== 'string' || message.trim() === '') {
      await sendMessage(senderId, { text: 'Veuillez envoyer un message valide.' }, pageAccessToken);
      return;
    }

    const searchQuery = message.trim(); // Le message est directement utilisé comme requête
    const imageCount = 2;  // Toujours envoyer 2 images

    try {
      // Appel à l'API pour récupérer les images
      const { data } = await axios.get(`https://hiroshi-api.onrender.com/image/pinterest?search=${encodeURIComponent(searchQuery)}`);

      const selectedImages = data.data.slice(0, imageCount);

      if (selectedImages.length === 0) {
        await sendMessage(senderId, { text: `Aucune image trouvée pour "${searchQuery}".` }, pageAccessToken);
        return;
      }

      // Envoi des 2 images en réponse
      for (const url of selectedImages) {
        const attachment = {
          type: 'image',
          payload: { url }
        };
        await sendMessage(senderId, { attachment }, pageAccessToken);
      }

    } catch (error) {
      console.error('Erreur:', error);
      await sendMessage(senderId, { text: 'Erreur : Impossible de récupérer les images.' }, pageAccessToken);
    }
  }
};
