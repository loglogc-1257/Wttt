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

    // Limite à 100 images max
    imageCount = Math.max(1, Math.min(imageCount, 100));

    try {
      const { data } = await axios.get(`https://api.nekorinn.my.id/search/pinterest?q=${encodeURIComponent(searchQuery)}`);
      const results = data.result;

      if (!Array.isArray(results) || results.length === 0) {
        await sendMessage(senderId, { text: `No images found for "${searchQuery}".` }, pageAccessToken);
        return;
      }

      const selectedImages = results.slice(0, imageCount);

      for (const result of selectedImages) {
        const imageUrl = result.imageUrl;
        if (!imageUrl) continue;

        const attachment = {
          type: 'image',
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        };

        await sendMessage(senderId, { attachment }, pageAccessToken);
        await new Promise(res => setTimeout(res, 500)); // Pause entre chaque image
      }

    } catch (error) {
      console.error('Pinterest Error:', error);
      await sendMessage(senderId, { text: '❌ Erreur lors de la récupération des images.' }, pageAccessToken);
    }
  }
};
