const { sendMessage } = require('./sendMessage');

function handlePostback(event, pageAccessToken) {
    const senderId = event.sender.id;
    const payload = event.postback.payload;

    let responseText = "";

    if (payload === "COMMANDS") {
        responseText = "📜 *Voici la liste des commandes disponibles :*\n\n" +
                       "🔹 *!anime* - Infos sur un anime\n" +
                       "🔹 *!manga* - Trouver un manga\n" +
                       "🔹 *!imagine* - Générer une image IA\n" +
                       "🔹 *!music* - Écouter de la musique\n" +
                       "🔹 *!gpt* - Poser une question à l'IA\n" +
                       "🔹 *!tiktok* - Télécharger une vidéo TikTok\n" +
                       "🔹 *!pinterest* - Rechercher une image\n" +
                       "🔹 *!sing* - Chanter une chanson 🎤\n\n" +
                       "👉 *Sélectionne une autre option ci-dessous :*";

    } else if (payload === "SEARCH") {
        responseText = "🔍 Que veux-tu rechercher ?";
        
    } else if (payload === "PLAY_GAME") {
        responseText = "🎮 Lancement du jeu...";

    } else {
        responseText = "❓ Je ne comprends pas cette action.";
    }

    sendMessage(senderId, { text: responseText }, pageAccessToken);
}

module.exports = { handlePostback };
