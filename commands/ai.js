const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'ai',
  description: 'Interact with Free GPT - OpenAI.',
  author: 'Arn',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(" ").toLowerCase();

    if (!query) {
      const defaultMessage = "Salut moi c'est Mickey, mon rôle est de vous aider dans vos différentes tâches.";
      return await sendMessage(senderId, { text: defaultMessage }, pageAccessToken);
    }

    if (query === "sino creator mo?" || query === "who created you?") {
      const jokeMessage = "Stanley Stawa";
      return await sendMessage(senderId, { text: jokeMessage }, pageAccessToken);
    }

    await handleChatResponse(senderId, query, pageAccessToken);
  },
};

const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/gpt-4o";

  try {
    const response = await axios.post(apiUrl, { 
      ask: input, 
      uid: senderId, 
      webSearch: "on" 
    });

    const aiResponse = response.data.response;
    await sendConcatenatedMessage(senderId, aiResponse, pageAccessToken);
  } catch (error) {
    console.error('Error while processing AI response:', error.message);
    const errorMessage = '❌ Une erreur est survenue.';
    await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
  }
};

const sendConcatenatedMessage = async (senderId, text, pageAccessToken) => {
  const maxMessageLength = 2000; // Messenger a une limite de 2000 caractères

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
};

const splitMessageIntoChunks = (message, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
};
