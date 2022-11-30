const express = require('express')
const ejsMate = require('ejs-mate')

const app = express()
const port = 3000

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', './')
app.use(express.urlencoded({extended: true}))


// balances array for holding payer balances.
// only one object per payer.
// transactions array for tracking transactions.
// payer may have multiple objects (transactions) under 
// their name. object is removed by spendPoints()
const balances = [], transactions = [];


app.get('/', (req, res) => {
    res.render('index.ejs', {transaction: transactions})
})

// New transaction route
app.post('/', (req, res) => {
    // parse the information
    // everything in req.body is a string so we must convert 'points' to Number type
    const { payer } = req.body
    const points = parseInt(req.body.points)
    const timestamp = req.body.timestamp || new Date(Date.now()).toUTCString()
    
    const transaction = {
        payer: payer || undefined,
        points: points || undefined,
        timestamp: timestamp || undefined
    }
    if (transaction.points > 0) {
        transactions.push(transaction)
    }
    processTransaction(transaction)
    res.render('index.ejs', {transaction: transaction})
})

// Spend points route
app.post('/spend', (req, res) => {
    let spentPoints = parseInt(req.body.spentPoints)
    let spendResults = []
    
    spendPoints(spentPoints, spendResults)
    
    // res.render('spendresults.ejs', { spendResults: spendResults })
    res.render('spendresults.ejs', {spendResults: spendResults})
})

// View balances route
app.get('/balances', (req, res) => {
    res.render('viewbalances.ejs', { balances: balances })
})

/**
 * 
 * 1. add transaction to balances[] if balances[] is empty, else
 * 2. check if payer has preexising balance and
 * 3(a). add or subtract from balance, or
 * 3(b). push new payer transaction if not preexisting
 *
 * @param {Object} t new transaction object
 */
function processTransaction(t) {
    // find if existing payer balance
    let indexOfMatch = -1
    for (let i = 0; i < balances.length; i++) {
        if (balances[i].payer === t.payer) {
            indexOfMatch = i
            i += balances.length
        }
    }
    // if payer account exists...
    if (indexOfMatch > -1) {
        // ...check for negative points
        if (t.points < 0) {
            // Check to prevent negative balance:
            if ((balances[indexOfMatch].points + t.points) < 0) {
                t.payer = 'balance cannot become negative'
                t.points = 0
                t.timestamp = 0
            } else {
                // Negative points must be subtracted from the transactions 
                // array (which keeps chronological order of points)
                for (let i = 0; i < transactions.length; i++) {
                    if (t.payer === transactions[i].payer) {
                        transactions[i].points += t.points
                        i += transactions.length
                    }
                }
            }
        }
        // add (or subtract) value from existing payer
        balances[indexOfMatch].points += t.points
    } else {
        // must create new object or balance[] and transactions[]
        // will have pointers to the same address!
        const newT = { ...t }
        balances.push(newT)
    }
}


/** 
 *
 * @param {number} numPoints balance of points to be deducted from
 * @param {array} spendLog for displaying every deduction that occurs
 *
 */
function spendPoints(numPoints, spendLog) {
    // while numPoints > 0
    // Subtract oldest points from numPoints
    
        while (numPoints != 0) {
            // if [i].points > numPoints then
            // subtract numPoints from [i].points, change [i].points value
            // and record the math
            if (transactions[0].points > numPoints) {
                transactions[0].points -= numPoints
                let result = {
                    payer: transactions[0].payer,
                    points: `-${numPoints}`
                }
                spendLog.push(result)
                numPoints = 0
            } else {
                // subtract [i].points from numPoints, remove transaction from array
                numPoints -= transactions[0].points
                let result = {
                    payer: transactions[0].payer,
                    points: `-${transactions[0].points}`
                }
                spendLog.push(result)
                transactions.shift()
            }
        }
    updateBalances()
}


/** 
 * Provides updated payer balances after a points spend
 */ 
function updateBalances() {
    // clear the existing balances
    balances.splice(0, balances.length)
    // register each transaction back into the balances array
    transactions.forEach((transaction) => {
        processTransaction(transaction)
    })
}

app.listen(port, console.log(`Listening on port ${port}`))