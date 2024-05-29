import axios from 'axios';

// Function to check and update scores
const checkAndUpdateScores = async (duel, users, channel) => {
    // if (!duel.userHandles) {
    //     console.error('duel.userHandles is undefined', duel);
    //     return channel.send('An error occurred: duel.userHandles is undefined.');
    // }

    console.log('fourth', duel);
    // const userHandles = duel.participants.map(userId => duel.participants[userId]);
    const userHandles = duel.participants.map(userId => users.get(userId));
    // userHandles = [];
    // for (ob in users)

    const newUser = new Map();

    for (const [key, value] of users.entries()) {
        if (typeof value === 'string') {
            newUser.set(value, key);
        }
    }

    console.log(newUser);


    console.log(users);
    const submissions = {};

    console.log(userHandles);

    // Fetch recent submissions for both users
    for (const handle of userHandles) {
        const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10`);
        submissions[handle] = response.data.result;
    }
    console.log(submissions);

    // Track which problems have been solved
    for (const problemIndex in duel.problems) {
        const problem = duel.problems[problemIndex];

        console.log('incheckupdatescore', problem);
        console.log('inchecupdatescore', duel.problems);

        if (duel.solvedProblems[problemIndex]) {
            continue; // Skip already scored problems
        }

        const user1Solved = submissions[userHandles[0]].some(submission => (
            submission.problem.contestId === problem.contestId &&
            submission.problem.index === problem.index &&
            submission.verdict === 'OK'
        ));

        const user2Solved = submissions[userHandles[1]].some(submission => (
            submission.problem.contestId === problem.contestId &&
            submission.problem.index === problem.index &&
            submission.verdict === 'OK'
        ));

        if (user1Solved || user2Solved) {
            // Determine who solved it first if both solved it
            if (user1Solved && user2Solved) {
                const user1SubmissionTime = submissions[userHandles[0]].find(submission => (
                    submission.problem.contestId === problem.contestId &&
                    submission.problem.index === problem.index &&
                    submission.verdict === 'OK'
                )).creationTimeSeconds;

                const user2SubmissionTime = submissions[userHandles[1]].find(submission => (
                    submission.problem.contestId === problem.contestId &&
                    submission.problem.index === problem.index &&
                    submission.verdict === 'OK'
                )).creationTimeSeconds;

                if (user1SubmissionTime < user2SubmissionTime) {
                    duel.solvedProblems[problemIndex] = userHandles[0];
                    duel.scores[newUser.get(userHandles[0])] += problem.rating;
                } else {
                    duel.solvedProblems[problemIndex] = userHandles[1];
                    duel.scores[newUser.get(userHandles[1])] += problem.rating;
                }
            } else if (user1Solved) {
                duel.solvedProblems[problemIndex] = userHandles[0];
                duel.scores[newUser.get(userHandles[0])] += problem.rating;
            } else if (user2Solved) {
                duel.solvedProblems[problemIndex] = userHandles[1];
                duel.scores[newUser.get(userHandles[1])] += problem.rating;
            }
        }
    }
    // console.log(userHandles[0]);
    // console.log(newUser.get(userHandles[0]));
    // console.log(newUser[userHandles[1]]);
    // console.log(newUser)
    // console.log(duel.scores[newUser[userHandles[1]]])
    // Log current scores
    channel.send(`Current scores:\n${userHandles[0]}: ${duel.scores[newUser.get(userHandles[0])]}\n${userHandles[1]}: ${duel.scores[newUser.get(userHandles[1])]}`);
};

export { checkAndUpdateScores };
