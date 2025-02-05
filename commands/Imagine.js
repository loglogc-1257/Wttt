const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imagine',
  description: 'Generates an image based on a prompt using FLUX 1.1 Pro API',
  author: 'DP',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a prompt for image generation.' }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const API_KEY = "c878dbc8-c7ec-4e74-98ac-498249cceda9";  // Remplacez cette clé par une variable d'environnement pour la sécurité
    const apiUrl = "https://api.bfl.ml/v1/generate";

    try {
      const response = await axios.post(apiUrl, {
        prompt: prompt,
        resolution: "2K",  // Modifiez en "4K" si disponible
        style: "realistic"
      }, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data && response.data.image_url) {
        await sendMessage(senderId, { attachment: { type: 'image', payload: { url: response.data.image_url } } }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Error: No image URL returned from API.' }, pageAccessToken);
      }

    } catch (error) {
      console.error('API Request Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not generate image.' }, pageAccessToken);
    }
  }
};
