const request = require('request');

function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment)) {
    console.error('Error: Message must provide valid text or attachment.');
    return;
  }

  const payload = {
    recipient: { id: senderId },
    message: {}
  };

  if (message.text) {
    payload.message.text = message.text;
  }

  if (message.attachment) {
    payload.message.attachment = message.attachment;
  }

  // Ajout des boutons interactifs
  payload.message.attachment = {
    type: "template",
    payload: {
      template_type: "button",
      text: message.text || "Que veux-tu faire ?",
      buttons: [
        { type: "postback", title: "📜 Commandes", payload: "COMMANDS" },
        { type: "postback", title: "🔍 Rechercher", payload: "SEARCH" },
        { type: "postback", title: "🎮 Jouer", payload: "PLAY_GAME" }
      ]
    }
  };

  request({
    url: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: pageAccessToken },
    method: 'POST',
    json: payload,
  }, (error, response, body) => {
    if (error) {
      console.error('Error sending message:', error);
    } else if (response.body.error) {
      console.error('Error response:', response.body.error);
    } else {
      console.log('Message sent successfully:', body);
    }
  });
}

// Fonction pour gérer les Quick Replies
function sendQuickReplies(senderId, pageAccessToken) {
  const payload = {
    recipient: { id: senderId },
    message: {
      text: "Sélectionne une option :",
      quick_replies: [
        { content_type: "text", title: "📜 Commandes", payload: "COMMANDS" },
        { content_type: "text", title: "🔍 Rechercher", payload: "SEARCH" },
        { content_type: "text", title: "🎮 Jouer", payload: "PLAY_GAME" }
      ]
    }
  };

  request({
    url: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: pageAccessToken },
    method: 'POST',
    json: payload,
  }, (error, response, body) => {
    if (error) {
      console.error('Error sending quick replies:', error);
    } else if (response.body.error) {
      console.error('Error response:', response.body.error);
    } else {
      console.log('Quick replies sent successfully:', body);
    }
  });
}

module.exports = { sendMessage, sendQuickReplies };
