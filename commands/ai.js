const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'gpt4',
  description: 'Interact with GPT-4o',
  usage: 'gpt4 [your message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) return sendMessage(senderId, { text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles." }, pageAccessToken);

    try {
      const { data: { response } } = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(prompt)}&uid=${senderId}&webSearch=On`);
      const parts = [];

      for (let i = 0; i < response.length; i += 1800) {
        parts.push(response.substring(i, i + 1800));
      }
      
      // send all msg parts
      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }
    } catch {
      sendMessage(senderId, { 
        text: "🤖 Oups ! Une petite erreur est survenue.\n\n" +
              "❓ Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }
  }
};
