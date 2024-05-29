import axios from 'axios';

const createDuelCommand = async (message, duels) => {
    const args = message.content.split(' ');
    if (args.length !== 1) {
        return message.reply('Usage: !createDuel');
    }

    console.log(message.author)

    const creatorId = message.author.id;
    if (duels.has(creatorId)) {
        return message.reply('You already created a duel or are part of an active duel. Finish that first!');
    }

    duels.set(creatorId, {
        creator: message.author.username,
        numberOfProblems: 5,
        ratingLowerBound: 1000,
        ratingUpperBound: 2000,
        participants: [creatorId],
        isWaiting: true, // Indicates waiting for second participant
        problems: [],
        scores: { [creatorId]: 0 },
        solvedProblems: {},
        startTime: null
    });

    message.reply('Duel created! Waiting for another participant to join. Type `!acceptDuel <creator_username>` to join.');
};

export default createDuelCommand;
