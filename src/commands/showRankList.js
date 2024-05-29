// commands/ranklistCommand.js
import axios from 'axios';
import { EmbedBuilder } from '@discordjs/builders';

const ranklistCommand = async (message, users) => {
    const args = message.content.split(' ');
    if (args.length !== 2) {
        return message.reply('Usage: !ranklist <round number>');
    }

    const roundNumber = args[1];

    // Get all registered Codeforces handles that are strings
    const handles = Array.from(users.values()).filter(value => typeof value === 'string').join(';');
    if (!handles) {
        return message.reply('No registered Codeforces handles found.');
    }

    try {
        // Fetch contest standings from the Codeforces API
        const response = await axios.get(`https://codeforces.com/api/contest.standings`, {
            params: {
                contestId: roundNumber,
                from: 1,
                count: 20, // Adjust the count as needed
                showUnofficial: true,
                handles: handles
            }
        });

        const standings = response.data.result.rows;
        if (!standings || standings.length === 0) {
            return message.reply('No standings data found for the specified contest.');
        }

        // Create an embed message
        const standingsEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`Standings for Contest ${roundNumber}`)
            .setTimestamp()
            .setFooter({ text: 'Contest Standings', iconURL: message.author.avatarURL() });

        // Add standings data to the embed
        standings.forEach((row, index) => {
            standingsEmbed.addFields(
                { name: `${index + 1}. ${row.party.members[0].handle}`, value: `Rank: ${row.rank}`, inline: true }
            );
        });

        // Send the embed message in the channel
        message.channel.send({ embeds: [standingsEmbed] });
    } catch (error) {
        console.error('Error fetching contest standings:', error);
        message.reply('An error occurred while fetching the contest standings.');
    }
};

export default ranklistCommand;