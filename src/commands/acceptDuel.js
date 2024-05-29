import { startDuelSession } from "../utils/startDuelSession.js";
const acceptDuelCommand = async (message, duels, users) => {
    const args = message.content.split(' ');
    if (args.length !== 2) {
        return message.reply('Usage: !acceptDuel <creator_username>');
    }

    console.log(duels);

    const participantId = message.author.id;
    const participantUserName = message.author.username;
    const creatorUsername = args[1];
    console.log(creatorUsername);

    const duel = Array.from(duels.values()).find(duel => duel.isWaiting && duel.creator === creatorUsername);

    if (!duel) {
        return message.reply('Invalid or expired duel invitation.');
    }

    if (duel.creator === participantUserName) {
        return message.reply('You cannot accept your own duel invitation.');
    }

    duel.isWaiting = false; // Mark duel as active
    duel.participants.push(participantId);
    duel.scores[participantId] = 0;

    console.log('first', duel);

    message.reply(`You have joined the duel with ${creatorUsername}! The duel will start now.`);

    // Start the duel session
    startDuelSession(duel, message.channel, duels, users);
};

export default acceptDuelCommand;
