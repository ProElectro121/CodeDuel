const sendContestReminders = (contests, client) => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

    for (const contest of contests) {
        const contestStartTime = new Date(contest.startTimeSeconds * 1000);
        console.log(contest);
        // Check if the contest starts within the next 10 minutes
        if (true) {
            const server = client.guilds.cache.get(process.env.SERVER_ID); // Replace with your server ID
            if (server) {
                console.log('Server found:', server.name);
                console.log(server.channels);
                const channel = server.channels.cache.find(channel => (channel.type === 0)); // Find a text channel in the server
                if (channel) {
                    const startTime = new Date(contest.startTimeSeconds * 1000);
                    const formattedStartTime = startTime.toLocaleString();
                    console.log('Text channel found:', channel.name);
                    channel.send(`Reminder: Contest "${contest.name}" starts in ${formattedStartTime}. Good Luck!`);
                } else {
                    console.log('No text channels found in the server.');
                }
            } else {
                console.log('Server not found.');
            }
        }
    }
};

export default sendContestReminders;
