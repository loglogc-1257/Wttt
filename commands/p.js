const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const tokenPath = './token.txt';
const pageAccessToken = fs.readFileSync(tokenPath, 'utf8').trim();

module.exports = {
  name: 'p',
  aliases: [
    'A', 'a', 'B', 'b', 'C', 'c', 'D', 'd', 'E', 'e', 'F', 'f', 'G', 'g', 
    'H', 'h', 'I', 'i', 'J', 'j', 'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n', 
    'O', 'o', 'P', 'p', 'Q', 'q', 'R', 'r', 'S', 's', 'T', 't', 'U', 'u', 
    'V', 'v', 'W', 'w', 'X', 'x', 'Y', 'y', 'Z', 'z'
  ], 
  description: 'Search Pinterest for images.',
  usage: '-p prompt',
  author: 'coffee',

  async execute(senderId, args) {
    // Vérifier si l'utilisateur a fourni un terme de recherche
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a search query.' }, pageAccessToken);
      return;
    }

    // Requête de recherche sur Pinterest
    const searchQuery = args.join(' ');

    try {
      const { data } = await axios.get(`https://hiroshi-api.onrender.com/image/pinterest?search=${encodeURIComponent(searchQuery)}`);

      // Sélectionner exactement 2 images (ou moins si pas assez de résultats)
      const selectedImages = data.data.slice(0, 2);

      if (selectedImages.length === 0) {
        await sendMessage(senderId, { text: `No images found for "${searchQuery}".` }, pageAccessToken);
        return;
      }

      // Envoyer les 2 images
      for (const url of selectedImages) {
        const attachment = {
          type: 'image',
          payload: { url }
        };
        await sendMessage(senderId, { attachment }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not fetch images.' }, pageAccessToken);
    }
  }
};
