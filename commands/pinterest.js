const axios = require('axios');
const fs = require('fs');
const { sendMessage } = require('../handles/sendMessage');

const tokenPath = './token.txt';
const pageAccessToken = fs.readFileSync(tokenPath, 'utf8').trim();

module.exports = {
  name: 'pinterest',
  description: 'Search Pinterest for images.',
  usage: '-pinterest prompt -number',
  author: 'coffee',

  async execute(senderId, args) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a search query.' }, pageAccessToken);
      return;
    }

    const match = args.join(' ').match(/(.+)-(\d+)$/);
    const searchQuery = match ? match[1].trim() : args.join(' ');
    let imageCount = match ? parseInt(match[2], 10) : 5;

    imageCount = Math.max(1, Math.min(imageCount, 20));

    try {
      // Appel à la nouvelle API
      const { data } = await axios.get(`https://api.nekorinn.my.id/search/pinterest?q=${encodeURIComponent(searchQuery)}`);

      // Selon la structure retournée par la nouvelle API,
      // ici j'assume que les URLs des images sont dans data.result ou data.data (à ajuster si besoin)
      const images = data.result || data.data || [];

      const selectedImages = images.slice(0, imageCount);

      if (selectedImages.length === 0) {
        await sendMessage(senderId, { text: `No images found for "${searchQuery}".` }, pageAccessToken);
        return;
      }

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
