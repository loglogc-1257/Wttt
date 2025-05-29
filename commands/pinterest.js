const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage'); // ta fonction d'envoi
const tokenPath = './token.txt';
const fs = require('fs');
const pageAccessToken = fs.readFileSync(tokenPath, 'utf8').trim();

module.exports = {
  name: 'pinterest',
  description: 'Search Pinterest for images.',
  usage: '-pinterest prompt -number',
  author: 'coffee',

  async execute(senderId, args) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a search query.' }, pageAccessToken);
      return;
    }

    // Extraction du nombre d'images demandé (1 à 20)
    const match = args.join(' ').match(/(.+)-(\d+)$/);
    const searchQuery = match ? match[1].trim() : args.join(' ');
    let imageCount = match ? parseInt(match[2], 10) : 5;
    imageCount = Math.max(1, Math.min(imageCount, 20));

    try {
      const response = await axios.get(`https://api.nekorinn.my.id/search/pinterest?q=${encodeURIComponent(searchQuery)}`);

      // Extraction des résultats
      const pins = response.data.result || [];

      if (pins.length === 0) {
        await sendMessage(senderId, { text: `No images found for "${searchQuery}".` }, pageAccessToken);
        return;
      }

      // Limite selon le nombre demandé
      const selectedPins = pins.slice(0, imageCount);

      // Envoi des images directement en URL pour Facebook Messenger
      for (const pin of selectedPins) {
        if (!pin.imageUrl) continue;

        const attachment = {
          type: 'image',
          payload: { url: pin.imageUrl }
        };

        // Tu peux envoyer aussi un texte avec la première image pour préciser la recherche
        await sendMessage(
          senderId,
          {
            text: `📌 Pinterest results for: "${searchQuery}"`,
            attachment
          },
          pageAccessToken
        );
      }

    } catch (error) {
      console.error('Error fetching Pinterest images:', error);
      await sendMessage(senderId, { text: 'Error: Could not fetch images.' }, pageAccessToken);
    }
  }
};
