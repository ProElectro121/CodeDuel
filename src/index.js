// index.js
import { Client, GatewayIntentBits } from 'discord.js';
import { handleInfoUserCommand } from './commands/infoUser.js';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import fs from 'fs';
import registerCommand from './commands/register.js';
import unregisterCommand from './commands/unregister.js';
import sendContestReminders from './utils/contestReminder.js';
import fetchUpcomingContests from './utils/fetchContest.js';
import ranklistCommand from './commands/showRankList.js';
import mashupCommand from './commands/mashup.js';
import mashupHistoryCommand from './commands/mashupHistory.js';
import acceptDuelCommand from './commands/acceptDuel.js';
import createDuelCommand from './commands/createDuel.js';
import { checkAndUpdateScores } from './utils/checkAndUpdateScores.js';
import { compareUserWins } from './commands/compareWinsCommand.js';
import pkg from 'discord.js'
// import express from 'express'

const { MessageEmbed } = pkg;

import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ]
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');


let users = new Map();
let duels = new Map(); // Map to store active duels



// Load user data from the JSON file
const loadUserData = () => {
    if (fs.existsSync(usersFilePath)) {
        const data = fs.readFileSync(usersFilePath, 'utf-8');
        const jsonData = JSON.parse(data);
        users = new Map(Object.entries(jsonData));
    }
};

// Save user data to the JSON file
const saveUserData = () => {
    const jsonData = JSON.stringify(Object.fromEntries(users), null, 2);
    fs.writeFileSync(usersFilePath, jsonData, 'utf-8');
};

loadUserData();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Check for upcoming contests and send reminders every 5 minutes
    setInterval(async () => {
        console.log('command comming here');
        const contests = await fetchUpcomingContests();
        sendContestReminders(contests, client);
    }, 10 * 60 * 1000); // 10 minutes 

});




client.on('messageCreate', async (message) => {
    console.log(message.content)
    if (message.content.toLowerCase().startsWith('!infouser')) {
        await handleInfoUserCommand(message);
    }
    if (message.content.toLowerCase().startsWith('!register')) {
        await registerCommand(message, users, saveUserData, axios);
    }
    if (message.content.toLowerCase().startsWith('!unregister')) {
        console.log('exection coming here')
        await unregisterCommand(message, users, saveUserData);
    }
    if (message.content.toLowerCase().startsWith('!ranklist')) {
        await ranklistCommand(message, users);
    }
    if (message.content.toLowerCase().startsWith('!createmashup')) {
        await mashupCommand(message, users);
    }
    if (message.content.toLowerCase().startsWith('!mashuphistory')) {
        console.log('control coming here');
        mashupHistoryCommand(message, users);
    }
    if (message.content.toLowerCase().startsWith('!createduel')) {
        await createDuelCommand(message, duels);
    }
    if (message.content.toLowerCase().startsWith('!acceptduel')) {
        await acceptDuelCommand(message, duels, users);
    }
    if (message.content.toLowerCase().startsWith('!duelupdate')) {
        const duel = Array.from(duels.values()).find(duel => duel.participants.includes(message.author.id));
        if (duel) {
            console.log('third', duel);
            await checkAndUpdateScores(duel, users, message.channel);
        } else {
            message.reply('You are not currently in a duel.');
        }
    }
    if (message.content.toLowerCase().startsWith('!comparewins')) {
        console.log('control coming here');
        const args = message.content.split(' ');
        if (args.length !== 3) {
            message.channel.send('Usage: !comparewins username1 username2');
            return;
        }
        const [_, username1, username2] = args;
        await compareUserWins(username1, username2, message.channel);
    }
});

client.login(process.env.TOKEN);

// Keep the server alive
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Discord bot is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { saveUserData }; 
