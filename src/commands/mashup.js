import axios from 'axios';
import { saveUserData } from '../index.js';

const fetchUnsolvedProblems = async (userHandle, count, minRating, maxRating) => {
    try {
        const response = await axios.get(`https://codeforces.com/api/user.status`, {
            params: {
                handle: userHandle
            }
        });
        const solvedProblems = new Set(
            response.data.result
                .filter(submission => submission.verdict === 'OK')
                .map(submission => `${submission.problem.contestId}-${submission.problem.index}`)
        );

        const problemsResponse = await axios.get(`https://codeforces.com/api/problemset.problems`);
        const unsolvedProblems = problemsResponse.data.result.problems.filter(problem =>
            problem.rating >= minRating &&
            problem.rating <= maxRating &&
            !solvedProblems.has(`${problem.contestId}-${problem.index}`)
        );

        return unsolvedProblems.slice(0, count);
    } catch (error) {
        console.error('Error fetching problems:', error);
        return [];
    }
};

const mashupCommand = async (message, users) => {
    const args = message.content.split(' ');
    if (args.length !== 5) {
        return message.reply('Usage: !createmashup <number_of_problems> <time_in_minutes> <rating_lower_bound> <rating_upper_bound>');
    }

    const numberOfProblems = parseInt(args[1], 10);
    const timeInMinutes = parseInt(args[2], 10);
    const ratingLowerBound = parseInt(args[3], 10);
    const ratingUpperBound = parseInt(args[4], 10);

    if (isNaN(numberOfProblems) || isNaN(timeInMinutes) || isNaN(ratingLowerBound) || isNaN(ratingUpperBound)) {
        return message.reply('Please provide valid numbers for number of problems, time, and rating range.');
    }

    if (numberOfProblems < 1 || numberOfProblems > 5) {
        return message.reply('Number of problems should be between 1 and 5.');
    }

    if (timeInMinutes < 1 || timeInMinutes > 180) {
        return message.reply('Time should be between 1 and 180 minutes.');
    }

    const userId = message.author.id;
    const userHandle = users.get(userId);

    if (!userHandle) {
        return message.reply('You need to register your Codeforces handle first using !register command.');
    }

    // Fetch unsolved problems within the specified rating range
    const problems = await fetchUnsolvedProblems(userHandle, numberOfProblems, ratingLowerBound, ratingUpperBound);

    if (problems.length === 0) {
        return message.reply('No unsolved problems found with the specified criteria.');
    }

    // Start the mashup challenge
    let problemsList = 'Here are your problems:\n';
    problems.forEach(problem => {
        problemsList += `[${problem.name}](https://codeforces.com/contest/${problem.contestId}/problem/${problem.index})\n`;
    });

    message.reply(`${message.author}, your mashup challenge has started! You have ${timeInMinutes} minutes to solve ${numberOfProblems} problems.\n${problemsList}`);

    // Save the start time and problems to a history object
    const startTime = Date.now();
    const endTime = startTime + timeInMinutes * 60 * 1000;
    const mashupHistory = users.get(`${userId}_mashupHistory`) || [];
    mashupHistory.push({
        startTime,
        endTime,
        problems: problems.map(problem => ({
            name: problem.name,
            contestId: problem.contestId,
            index: problem.index,
            solved: false
        }))
    });
    users.set(`${userId}_mashupHistory`, mashupHistory);

    // Save user data to a JSON file (this function should be implemented in your index.js)
    saveUserData();

    // Schedule a function to check results after the allotted time
    setTimeout(async () => {
        const currentHistory = users.get(`${userId}_mashupHistory`);
        const latestMashup = currentHistory[currentHistory.length - 1];

        // Fetch user's submissions from Codeforces API
        const submissionsResponse = await axios.get(`https://codeforces.com/api/user.status`, {
            params: {
                handle: userHandle
            }
        });

        const submissions = submissionsResponse.data.result;
        latestMashup.problems.forEach(problem => {
            const solved = submissions.some(submission =>
                submission.contestId === problem.contestId &&
                submission.problem.index === problem.index &&
                submission.verdict === 'OK' &&
                submission.creationTimeSeconds * 1000 <= endTime
            );
            problem.solved = solved;
        });

        // Update mashup history
        users.set(`${userId}_mashupHistory`, currentHistory);
        saveUserData();

        // Send results to the user
        let resultMessage = `${message.author}, your mashup challenge has ended. Here are the results:\n\n`;
        latestMashup.problems.forEach(problem => {
            resultMessage += `${problem.name}: ${problem.solved ? 'Solved' : 'Not Solved'}\n`;
        });
        message.channel.send(resultMessage);
    }, timeInMinutes * 60 * 1000);
};

export default mashupCommand;
