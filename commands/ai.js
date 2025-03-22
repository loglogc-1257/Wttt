const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/gpt-4o";

  // Initialiser l'historique si l'utilisateur est nouveau
  if (!chatHistory[senderId]) {
    chatHistory[senderId] = [];
  }

  // Ajouter la question à l'historique
  chatHistory[senderId].push({ role: "user", message: input });

  try {
    // Envoyer la requête POST à l'API GPT-4o
    const { data } = await axios.post(apiUrl, { 
      ask: input, 
      uid: senderId, 
      webSearch: "on" 
    }, {
      headers: { "Content-Type": "application/json" }
    });

    const response = data.response;

    // Ajouter la réponse de l'IA à l'historique
    chatHistory[senderId].push({ role: "ai", message: response });

    await sendLongMessage(senderId, response, pageAccessToken);
  } catch (error) {
    console.error('Erreur AI:', error.message);
    await sendMessage(senderId, { text: "⚠️ Veuillez patienter un instant !" }, pageAccessToken);
  }
};
