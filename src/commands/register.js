const registerCommand = async (message, users, saveUserData, axios) => {
    if (message.content.startsWith('!register')) {
        const args = message.content.split(' ');
        if (args.length !== 2) {
            message.channel.send('Usage: !register <CodeforcesHandle>');
            return;
        }
        const codeforcesHandle = args[1];

        // Check if the Codeforces handle is already registered by any user
        for (let [userId, handle] of users) {
            if (handle === codeforcesHandle) {
                message.channel.send(`The Codeforces handle ${codeforcesHandle} is already registered by another user.`);
                return;
            }
        }

        // Validate the handle using Codeforces API
        try {
            const response = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesHandle}`);
            if (response.data.status !== 'OK') {
                message.channel.send('Invalid Codeforces handle. Please try again.');
                return;
            }
        } catch (error) {
            message.channel.send('Error verifying Codeforces handle. Please make sure the handle is correct.');
        }

        // Hardcoded problem details
        const contestId = 4; // Replace with the actual contest ID
        const problemIndex = 'A'; // Replace with the actual problem index
        const problemLink = `https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`;

        message.channel.send(`To verify your Codeforces handle, solve this problem within 1 minute: ${problemLink}`);

        // Set a timeout to check for the submission after 1 minute
        setTimeout(async () => {
            try {
                const submissionsResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${codeforcesHandle}&from=1&count=10`);
                const submissions = submissionsResponse.data.result;
                const problemSolved = submissions.some(submission =>
                    submission.problem.contestId === contestId &&
                    submission.problem.index === problemIndex
                );

                if (problemSolved) {
                    users.set(message.author.id, codeforcesHandle);
                    saveUserData();
                    message.channel.send(`Successfully registered ${codeforcesHandle} for ${message.author.username}`);
                } else {
                    message.channel.send('Verification failed. Please try again.');
                }
            } catch (error) {
                message.channel.send('Error verifying the solution. Please try again later.');
            }
        }, 60000); // 1 minute timeout
    }
};

export default registerCommand;