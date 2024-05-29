import axios from 'axios';
import { checkAndUpdateScores } from './checkAndUpdateScores.js';


const fetchUnsolvedProblems = async (userHandle, count, minRating, maxRating) => {
    try {
        const response1 = await axios.get(`https://codeforces.com/api/user.status`, {
            params: {
                handle: userHandle[0]
            }
        });
        const response2 = await axios.get(`https://codeforces.com/api/user.status`, {
            params: {
                handle: userHandle[1]
            }
        });
        const solvedProblems1 = new Set(
            response1.data.result
                .filter(submission => submission.verdict === 'OK')
                .map(submission => `${submission.problem.contestId}-${submission.problem.index}`)
        );

        const solvedProblems2 = new Set(
            response2.data.result
                .filter(submission => submission.verdict === 'OK')
                .map(submission => `${submission.problem.contestId}-${submission.problem.index}`)
        );

        const problemsResponse = await axios.get(`https://codeforces.com/api/problemset.problems`);
        const unsolvedProblems = problemsResponse.data.result.problems.filter(problem =>
            problem.rating >= minRating &&
            problem.rating <= maxRating &&
            !solvedProblems1.has(`${problem.contestId}-${problem.index}`) &&
            !solvedProblems2.has(`${problem.contestId}-${problem.index}`)
        );

        return unsolvedProblems.slice(0, count);
    } catch (error) {
        console.error('Error fetching problems:', error);
        return [];
    }
};

const fetchProblems = async (duel, users) => {
    const { ratingLowerBound, ratingUpperBound, numberOfProblems } = duel;
    // const newUser = new Map();

    // for (const [key, value] of users.entries()) {
    //     if (typeof value === 'string') {

    //         newUser.set(value, key);
    //     }
    // }
    console.log('debughere', typeof duel, duel);
    const newUser = []

    const scores = duel.scores;
    console.log(users)

    users.forEach((key, value) => {
        console.log(key, value, typeof key);
        if (typeof key == 'string') { // key is likse codeforces username like puspendra_09
            let found = false;
            for (const [userId, username] of Object.entries(scores)) {
                console.log('insider score object', userId, username);
                if (value == userId) {
                    found = true;
                }
            }
            if (found) {
                newUser.push(key);
            }
        }
    });

    console.log(newUser);


    const problemArray = await fetchUnsolvedProblems(newUser, numberOfProblems, ratingLowerBound, ratingUpperBound);
    console.log(problemArray);
    return problemArray;

};

// const fetchProblems = async (duel) => {
//     const { ratingLowerBound, ratingUpperBound, numberOfProblems } = duel;
//     const response = await axios.get(`https://codeforces.com/api/problemset.problems`);
//     const problems = response.data.result.problems.filter(problem => {
//         return problem.rating >= ratingLowerBound && problem.rating <= ratingUpperBound;
//     });

//     // Select random problems
//     const selectedProblems = [];
//     while (selectedProblems.length < numberOfProblems) {
//         const randomIndex = Math.floor(Math.random() * problems.length);
//         selectedProblems.push(problems[randomIndex]);
//         problems.splice(randomIndex, 1); // Remove selected problem
//     }
//     return selectedProblems;
// };

const startDuelSession = async (duel, channel, duels, users) => {
    const problems = await fetchProblems(duel, users);
    duel.problems = problems;
    duel.startTime = Date.now();
    duel.solvedProblems = {};

    console.log('second', duel);

    channel.send(`The duel has started! You have 1 hour to solve the problems. Here are the problems:`);

    problems.forEach((problem, index) => {
        channel.send(`${index + 1}. [${problem.name}](https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}) - Rating: ${problem.rating}`);
    });

    // Set interval to show updates every 10 minutes
    duel.interval = setInterval(() => {
        showDuelStatus(duel, channel);
    }, 10 * 60 * 1000);

    // Set timeout to end duel after 1 hour
    setTimeout(() => {
        endDuel(duel, channel, duels, users);
    }, 2 * 60 * 1000); // don't forgppt to multiply by 60 here
};

const showDuelStatus = (duel, channel) => {
    let statusMessage = 'Duel status:\n';
    duel.participants.forEach(participant => {
        statusMessage += `<@${participant}>: ${duel.scores[participant]} points\n`;
    });
    // checkAndUpdateScores(duel ,  , )
    channel.send(statusMessage);
};

const endDuel = async (duel, channel, duels, users) => {
    clearInterval(duel.interval);

    await checkAndUpdateScores(duel, users, channel);

    let resultMessage = 'The duel has ended! Here are the final scores:\n';
    duel.participants.forEach(participant => {
        resultMessage += `<@${participant}>: ${duel.scores[participant]} points\n`;
    });

    const winner = duel.participants.reduce((prev, curr) => duel.scores[prev] > duel.scores[curr] ? prev : curr);
    resultMessage += `The winner is <@${winner}>!`;

    channel.send(resultMessage);

    // Remove duel from active duels
    duel.participants.forEach(participant => {
        duels.delete(participant);
    });
};

export { startDuelSession };
