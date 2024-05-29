// commands/infoUser.js
import { main } from '../utils/api.js';
import { EmbedBuilder } from '@discordjs/builders';

export async function handleInfoUserCommand(message) {
    const updatedMessage = message.content.toLowerCase();
    const args = updatedMessage.split(' ');

    if (args.length !== 2) {
        message.channel.send('Usage: !InfoUser <CodeforcesHandle>');
        return;
    }

    try {
        const userInfo = await main(args[1]);
        if (userInfo && userInfo.length > 0) {
            const user = userInfo[0];
            const userEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`${user.handle}'s Codeforces Profile`)
                .setURL(`https://codeforces.com/profile/${user.handle}`)
                .setThumbnail(user.avatar)
                .addFields(
                    { name: 'Handle', value: user.handle, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }, // Empty field for spacing
                    { name: 'Country', value: user.country || 'N/A', inline: true },
                    { name: 'City', value: user.city || 'N/A', inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }, // Empty field for spacing
                    { name: 'Organization', value: user.organization || 'N/A', inline: true },
                    { name: 'Rank', value: user.rank, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }, // Empty field for spacing
                    { name: 'Max Rank', value: user.maxRank, inline: true },
                    { name: 'Rating', value: user.rating ? user.rating.toString() : 'N/A', inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }, // Empty field for spacing
                    { name: 'Max Rating', value: user.maxRating ? user.maxRating.toString() : 'N/A', inline: true },
                    { name: 'Friends', value: user.friendOfCount.toString(), inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }, // Empty field for spacing
                    { name: 'Contribution', value: user.contribution.toString(), inline: true },
                    { name: 'Last Online', value: new Date(user.lastOnlineTimeSeconds * 1000).toLocaleString(), inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }, // Empty field for spacing
                    { name: 'Registered', value: new Date(user.registrationTimeSeconds * 1000).toLocaleString(), inline: true }
                )
                .setImage(user.titlePhoto)
                .setTimestamp()
                .setFooter({ text: 'Codeforces User Info', iconURL: 'https://codeforces.org/s/13255/images/favicon32.png' });

            message.channel.send({ embeds: [userEmbed] });
        } else {
            message.channel.send('User not found or an error occurred.');
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        message.channel.send('An error occurred while fetching user info. Please try again later.');
    }
}
