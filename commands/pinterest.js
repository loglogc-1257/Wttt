const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

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

    imageCount = Math.max(1, Math.min(imageCount, 10)); // max 10 comme dans ton exemple

    try {
      // Appel API principale
      let response;
      try {
        response = await axios.get(`https://api.nekorinn.my.id/search/pinterest?q=${encodeURIComponent(searchQuery)}`, { timeout: 10000 });
      } catch (primaryError) {
        // Fallback si échec
        response = await axios.get(`https://api.nekorinn.my.id/search/pinterest?q=${encodeURIComponent(searchQuery)}&count=${imageCount}`, { timeout: 10000 });
      }

      // Extraire la liste des pins/images
      let pins = [];
      if (response.data && response.data.data) {
        pins = response.data.data.pins || response.data.data || [];
      }

      if (!pins || pins.length === 0) {
        await sendMessage(senderId, { text: `No images found for "${searchQuery}".` }, pageAccessToken);
        return;
      }

      // Limiter au nombre demandé
      pins = pins.slice(0, imageCount);

      for (let i = 0; i < pins.length; i++) {
        const pin = pins[i];
        const imageUrl = pin.images?.orig?.url || pin.image || pin;

        if (!imageUrl) continue;

        const attachment = {
          type: 'image',
          payload: { url: imageUrl }
        };

        const text = i === 0
          ? `📌 Résultats Pinterest pour: "${searchQuery}" (${i + 1}/${pins.length})`
          : `(${i + 1}/${pins.length})`;

        await sendMessage(senderId, { text, attachment }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error fetching Pinterest images:', error);
      await sendMessage(senderId, { text: 'Error: Could not fetch images from Pinterest.' }, pageAccessToken);
    }
  }
};
