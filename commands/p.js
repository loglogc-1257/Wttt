const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const tokenPath = './token.txt';
const pageAccessToken = fs.readFileSync(tokenPath, 'utf8').trim();

module.exports = {
  name: 'p',
  aliases: ['A', 'a', 'B', 'b', 'C', 'c', 'D', 'd', 'E', 'e', 'F', 'f', 'G', 'g', 'H', 'h', 'I', 'i', 'J', 'j', 'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n', 'O', 'o', 'P', 'p', 'Q', 'q', 'R', 'r', 'S', 's', 'T', 't', 'U', 'u', 'V', 'v', 'W', 'w', 'X', 'x', 'Y', 'y', 'Z', 'z'

], // Alias supplémentaires
  description: 'Search Pinterest for images.',
  usage: '-pinterest prompt -number',
  author: 'coffee',

  async execute(senderId, args) {
    // Vérifier si les arguments sont valides
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a search query.' }, pageAccessToken);
      return;
    }

    // Extraction du mot-clé et du nombre d'images
    const match = args.join(' ').match(/(.+)-(\d+)$/);
    const searchQuery = match ? match[1].trim() : args.join(' ');
    let imageCount = match ? parseInt(match[2], 10) : 1; // Par défaut, 1 image

    // Limitation stricte à 1 ou 2 images
    imageCount = Math.max(1, Math.min(imageCount, 2));

    try {
      const { data } = await axios.get(`https://hiroshi-api.onrender.com/image/pinterest?search=${encodeURIComponent(searchQuery)}`);

      // Sélectionner le nombre d'images demandées
      const selectedImages = data.data.slice(0, imageCount);

      if (selectedImages.length === 0) {
        await sendMessage(senderId, { text: `No images found for "${searchQuery}".` }, pageAccessToken);
        return;
      }

      // Envoyer chaque image séparément (maximum 2)
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
