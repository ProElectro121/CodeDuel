// // const map = new Map();

// // map.set('puspednra', 2324242);
// // map.set('pragya', 2324242);

// // map.forEach((key, value) => {
// //     console.log(key, value);
// // });

// const duels = new Map([
//     ['1244519288836984865', {
//         creator: 'puspendra_18',
//         numberOfProblems: 5,
//         ratingLowerBound: 1000,
//         ratingUpperBound: 2000,
//         participants: ['1244519288836984865', '908974555815637082'],
//         isWaiting: false,
//         problems: [],
//         scores: { '1244519288836984865': 0, '908974555815637082': 0 },
//         solvedProblems: {},
//         startTime: null
//     }]
// ]);

// // Traverse the duels map
// for (const [duelId, duelDetails] of duels) {
//     console.log(`Duel ID: ${duelId}`);

//     // Access the scores object
//     const scores = duelDetails.scores;

//     // Traverse the scores object
//     for (const [userId, score] of Object.entries(scores)) {
//         console.log(`User ID: ${userId}, Score: ${score}`);
//     }
// }


var xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
var yValues = [55, 49, 44, 24, 15];
var barColors = ["red", "green", "blue", "orange", "brown"];

new Chart("myChart", {
    type: "bar",
    data: {
        labels: xValues,
        datasets: [{
            backgroundColor: barColors,
            data: yValues
        }]
    },
    options: {
        legend: { display: false },
        title: {
            display: true,
            text: "World Wine Production 2018"
        }
    }
});