function calculateRewardPoints(transactions) {
    // Define rules
    const rules = [
        { stores: ['sportcheck', 'tim_hortons', 'subway'], points: 500, amount: { 'sportcheck': 7500, 'tim_hortons': 2500, 'subway': 2500 } },
        { stores: ['sportcheck', 'tim_hortons'], points: 300, amount: { 'sportcheck': 7500, 'tim_hortons': 2500 } },
        { stores: ['sportcheck'], points: 200, amount: { 'sportcheck': 7500 } },
        { stores: ['sportcheck', 'tim_hortons', 'subway'], points: 150, amount: { 'sportcheck': 2500, 'tim_hortons': 1000, 'subway': 1000 } },
        // { stores: ['sportcheck', 'tim_hortons'], points: 75, amount: { 'sportcheck': 2500, 'tim_hortons': 1000 } }, this rule may as well never exist
        { stores: ['sportcheck'], points: 75, amount: { 'sportcheck': 2000 } },
        { stores: [], points: 1, amount: 100 }, // Rule 7 for all other purchases
    ];

    let globalStoreTotals = {};
    let transPointsEarned = {};
    let totalPoints = 0;

    for (const transactionId in transactions) {
        const transaction = transactions[transactionId];
        let transTotal = 0;

        if (!globalStoreTotals[transaction.merchant_code]) {
            globalStoreTotals[transaction.merchant_code] = 0;
        }

        globalStoreTotals[transaction.merchant_code] += transaction.amount_cents;

        let storeTotals = JSON.parse(JSON.stringify(globalStoreTotals));

        rules.forEach(rule => {
            if (rule.stores.length === 0) {
                const pointsEarned = Math.floor(Object.values(storeTotals).reduce((acc, value) => acc + value, 0) / rule.amount);
                transTotal += pointsEarned;
            } 
            else if (
                rule.stores.every(store => storeTotals[store] >= rule.amount[store])
            ) {
                // console.log("marker: "); console.log(rule)
                let divisionResults = {};
                for (const key of Object.keys(storeTotals)) {
                    if (storeTotals[key] && rule.amount[key]) divisionResults[key] = Math.floor(storeTotals[key] / rule.amount[key]);
                }

                const quotient = Math.min(...Object.values(divisionResults));
                const pointsEarned = quotient * rule.points;

                rule.stores.forEach(store => storeTotals[store] -= quotient * rule.amount[store]);
                // console.log(storeTotals)
                // console.log(pointsEarned)

                transTotal += pointsEarned;
            }
        });

        if (!transPointsEarned[transactionId]) transPointsEarned[transactionId] = 0;
        transPointsEarned[transactionId] = transTotal - totalPoints;

        totalPoints = transTotal;
    }

    return { totalPoints, transPointsEarned };
}

// Sample transactions
const transactions = {
    "T01": { "date": "2021-05-01", "merchant_code": "sportcheck", "amount_cents": 21000 },
    "T02": { "date": "2021-05-01", "merchant_code": "sportcheck", "amount_cents": 8700 },
    "T03": { "date": "2021-05-02", "merchant_code": "tim_hortons", "amount_cents": 323 },
    "T04": { "date": "2021-05-02", "merchant_code": "tim_hortons", "amount_cents": 1267 },
    "T05": { "date": "2021-05-02", "merchant_code": "tim_hortons", "amount_cents": 2116 },
    "T06": { "date": "2021-05-02", "merchant_code": "tim_hortons", "amount_cents": 2211 },
    "T07": { "date": "2021-05-03", "merchant_code": "subway", "amount_cents": 1853 },
    "T08": { "date": "2021-05-03", "merchant_code": "subway", "amount_cents": 2153 },
    "T09": { "date": "2021-05-01", "merchant_code": "sportcheck", "amount_cents": 7326 },
    "T10": { "date": "2021-05-02", "merchant_code": "tim_hortons", "amount_cents": 1321 },
    // Add other transactions here
};

// Calculate rewards points
const result = calculateRewardPoints(transactions);

// Display the result
console.log("Total Points:", result.totalPoints);
console.log("Transaction Level Points:", result.transPointsEarned);
