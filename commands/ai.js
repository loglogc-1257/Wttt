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
      const defaultMessage = "Salut moi c'est Mickey, mon role est de vous aider dans vos différentes tâches ";
      return await sendMessage(senderId, { text: defaultMessage }, pageAccessToken);
    }

    if (query === "sino creator mo?" || query === "who created you?") {
      const jokeMessage = "Stanley stawa";
      return await sendMessage(senderId, { text: jokeMessage }, pageAccessToken);
    }

    await handleChatResponse(senderId, query, pageAccessToken);
  },
};

const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/gpt-4o";

  try {
    const aidata = await axios.get(apiUrl, { params: { ask: input, uid: senderId, webSearch: "on" } });
    let response = aidata.data.response;

    await sendConcatenatedMessage(senderId, response, pageAccessToken);
  } catch (error) {
    console.error('Error while processing AI response:', error.message);
    const errorMessage = '❌ An error occurred.';
    await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
  }
};

const sendConcatenatedMessage = async (senderId, text, pageAccessToken) => {
  const maxMessageLength = 90000;

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
