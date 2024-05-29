// import { Client, GatewayIntentBits } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import axios from 'axios';

// const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const fetchUserContests = async (handle) => {
    const response = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
    return response.data.result;
};

const compareUserWins = async (username1, username2, channel) => {
    try {
        const user1Contests = await fetchUserContests(username1);
        const user2Contests = await fetchUserContests(username2);

        const user1ContestMap = new Map(user1Contests.map(contest => [contest.contestId, contest]));
        const user2ContestMap = new Map(user2Contests.map(contest => [contest.contestId, contest]));

        const commonContests = [...user1ContestMap.keys()].filter(contestId => user2ContestMap.has(contestId));

        if (commonContests.length === 0) {
            channel.send('No common contests found or unable to retrieve standings.');
            return;
        }

        const contestResults = commonContests.map(contestId => {
            const user1Contest = user1ContestMap.get(contestId);
            const user2Contest = user2ContestMap.get(contestId);

            const betterUser = user1Contest.rank < user2Contest.rank ? username1 : username2;
            return {
                contestName: user1Contest.contestName,
                user1Rank: user1Contest.rank,
                user2Rank: user2Contest.rank,
                betterUser
            };
        });

        const embed = new EmbedBuilder()
            .setTitle(`Comparison of ${username1} and ${username2}`)
            .setColor(0x0099ff)  // Use decimal format for color
            .setDescription('Here are the common contests and the better performer in each:')
            .addFields(
                { name: 'Contest', value: contestResults.map(result => result.contestName).join('\n'), inline: true },
                { name: username1, value: contestResults.map(result => result.user1Rank).join('\n'), inline: true },
                { name: username2, value: contestResults.map(result => result.user2Rank).join('\n'), inline: true },
                { name: 'Better Performer', value: contestResults.map(result => result.betterUser).join('\n'), inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Codeforces Contest Comparison', iconURL: 'https://codeforces.org/s/13255/images/favicon32.png' });

        channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error comparing users:', error);
        channel.send('An error occurred while comparing users.');
    }
};


export { compareUserWins };