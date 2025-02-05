const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Generate an image using Lexica API.',
  usage: '-imagine [image prompt]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();
    if (!prompt) return sendMessage(senderId, { text: 'Provide an image prompt.' }, pageAccessToken);

    const apiUrl = `https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.images && response.data.images.length > 0) {
        const imgUrl = response.data.images[0].src; // Prend la première image trouvée
        await sendMessage(senderId, { attachment: { type: 'image', payload: { url: imgUrl } } }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: 'No image found for the given prompt.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      sendMessage(senderId, { text: 'An error occurred while generating the image.' }, pageAccessToken);
    }
  }
};
