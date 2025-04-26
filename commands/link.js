const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8').trim();

module.exports = {
  name: 'link',
  description: 'Envoie un lien spécifique.',
  usage: 'link',
  author: 'Stanley',

  async execute(senderId) {
    try {
      await sendMessage(senderId, {
        text: 'Voici ton lien :\nhttps://stanleybotv4-generator.onrender.com/'
      }, token);
    } catch (error) {
      console.error(error);
      await sendMessage(senderId, { text: '❌ Impossible d\'envoyer le lien.' }, token);
    }
  }
};
