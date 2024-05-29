import axios from "axios";

const fetchUpcomingContests = async () => {
    try {
        console.log('inside the fetching contest funciton');
        const response = await axios.get('https://codeforces.com/api/contest.list?gym=false');
        if (response.data.status === 'OK') {
            const contests = response.data.result.filter(contest => (contest.phase === 'BEFORE' && Math.abs(contest.relativeTimeSeconds) >= 60 * 15));
            contests.reverse();
            let N = contests.length;
            for (let i = 1; i < N; i++) contests.pop();
            return contests;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching upcoming contests:', error);
        return [];
    }
};


export default fetchUpcomingContests;