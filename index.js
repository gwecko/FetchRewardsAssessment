const express = require('express')
const ejsMate = require('ejs-mate')

const app = express()
const port = 3000

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', './')
app.use(express.urlencoded())

// class Transaction {
//     constructor(payer, points, timestamp) {
//         this.payer = payer;
//         this.points = points;
//         this.timestamp = timestamp
//     }
// }

// array for holding transaction objects
const balances = []

app.get('/', (req, res) => {
    res.render('index.ejs', {transaction: balances})
})

// New transaction route (Payer, points, timestamp)
// FINISHED
app.post('/', (req, res) => {
    
    // parse the information
    // everything in req.body is a string so we must convert 'points' to Number type
    const { payer, points } = req.body
    const pointsInt = parseInt(points)
    const timestamp = req.body.timestamp || new Date(Date.now()).toUTCString()
    
    const transaction = {
        payer: payer,
        points: pointsInt,
        timestamp: timestamp
    }
    
    processTransaction(transaction, balances)
    res.render('index.ejs', {transaction: transaction})
})

// View balances route
app.get('/balances', (req, res) => {
    res.render('viewbalances.ejs', {balances: balances})
})

/**
 * 1. add transaction if balances[] is empty, else
 * 2. check if payer has preexising balance and
 * 3(a). add or subtract from balance, or
 * 3(b). push new payer transaction if not preexisting
 *
 * @param {obj} t new transaction object
 * @param {array} balances pre-existing record
 * @returns void
 */
function processTransaction(t, balances) {
    // check for empty array
    if (balances.length < 1) {
        balances.push(t)
    // check if preexisting payer exists
    } else {
        let match = false
        let indexOfMatch = -1
        while (!match) {
            balances.forEach((entry, i) => {
                if (entry.payer === t.payer) {
                    match = true
                    indexOfMatch = i
                }
                // set to true anyway at end of array to exit loop
                match = true
            })
        }
        // add balance if payer account exists, otherwise add new payer & balance
        if (indexOfMatch > -1) {
            // prevent negative balance
            if ((t.points < 0) && (balances[indexOfMatch].points + t.points) < 0) {
                t.payer = 'balance cannot become negative'
                t.points = 0
                t.timestamp = 0
            } else {
                balances[indexOfMatch].points += t.points
            }
        } else {
            balances.push(t)
        }
    }
    console.log('----------')
    console.log(balances)
}

app.listen(port, console.log(`Listening on port ${port}`))