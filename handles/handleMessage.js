const memory = {}; // Stocke les discussions temporairement

async function handleMessage(userId, message) {
    if (!memory[userId]) {
        memory[userId] = [];
    }

    memory[userId].push({"role": "user", "content": message});
    
    const response = await askGPT(memory[userId]);

    memory[userId].push({"role": "assistant", "content": response});

    return response;
}
