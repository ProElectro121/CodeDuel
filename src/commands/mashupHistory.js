// commands/mashupHistoryCommand.js
import { EmbedBuilder } from '@discordjs/builders';

const mashupHistoryCommand = (message, users) => {
    const userId = message.author.id;

    if (!users.has(`${userId}_mashupHistory`)) {
        return message.reply('You have no mashup history.');
    }

    const mashupHistory = users.get(`${userId}_mashupHistory`);
    if (mashupHistory.length === 0) {
        return message.reply('Your mashup history is empty.');
    }

    const historyEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`${message.author.username}'s Mashup History`)
        .setTimestamp()
        .setFooter({ text: 'Mashup History', iconURL: message.author.avatarURL() });

    mashupHistory.forEach((mashup, index) => {
        const startTime = new Date(mashup.startTime).toLocaleString();
        const endTime = new Date(mashup.endTime).toLocaleString();
        let problemsList = '';

        mashup.problems.forEach(problem => {
            problemsList += `- ${problem.name}: ${problem.solved ? 'Solved' : 'Not Solved'}\n`;
        });

        historyEmbed.addFields(
            { name: `Mashup ${index + 1}`, value: `Start Time: ${startTime}\nEnd Time: ${endTime}`, inline: false },
            { name: 'Problems', value: problemsList, inline: false },
            { name: '\u200B', value: '\u200B' } // Adding an empty field for spacing
        );
    });

    message.channel.send({ embeds: [historyEmbed] });
};

export default mashupHistoryCommand;
