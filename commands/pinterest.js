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
      await sendMessage(senderId, { text: '❗ Donne-moi un mot-clé pour chercher sur Pinterest.' }, pageAccessToken);
      return;
    }

    // Extraction du prompt + nombre
    const match = args.join(' ').match(/(.+)-(\d+)$/);
    const searchQuery = match ? match[1].trim() : args.join(' ');
    let imageCount = match ? parseInt(match[2], 10) : 5;

    imageCount = Math.max(1, Math.min(imageCount, 10)); // max 10 images

    try {
      const { data } = await axios.get(`https://api.nekorinn.my.id/search/pinterest?q=${encodeURIComponent(searchQuery)}`);

      if (!data || !data.result || data.result.length === 0) {
        await sendMessage(senderId, { text: `❌ Aucune image trouvée pour "${searchQuery}".` }, pageAccessToken);
        return;
      }

      const images = data.result.slice(0, imageCount);

      for (const img of images) {
        if (!img.imageUrl) continue;

        const attachment = {
          type: 'image',
          payload: { url: img.imageUrl, is_reusable: true }
        };

        await sendMessage(senderId, { attachment }, pageAccessToken);
      }

    } catch (error) {
      console.error('Erreur Pinterest:', error.message);
      await sendMessage(senderId, { text: '⚠️ Une erreur est survenue en récupérant les images.' }, pageAccessToken);
    }
  }
};
