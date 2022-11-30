### To start:
1. Navigate to the directory from your command line
2. Enter `npm i` in the command line to install necessary dependencies
3. Enter `node` in the command line to start; program will begin in your web browser at URL 'localhost:3000'

# Fetch Rewards Coding Exercise - Backend Software Engineering

Please write a web service that accepts HTTP requests and returns responses based on the conditions outlined in the next section. You can use any language and frameworks you choose.
Please assume the reviewer has not executed an application in your language/framework before when developing your documentation.

### Background
Our users have points in their accounts. Users only see a single balance in their accounts. But for reporting purposes we actually track their points per payer/partner. In our system, each transaction record contains: payer (string), points (integer), timestamp (date).
For earning points it is easy to assign a payer, we know which actions earned the points. And thus which partner should be paying for the points. When a user spends points, they don't know or care which payer the points come from. But, our accounting team does care how the points are spent.

#### There are two rules for determining what points to "spend" first:
- We want the oldest points to be spent first (oldest based on transaction timestamp, not the order they’re received) 
- We want no payer's points to go negative.

#### Provide routes that:
- Add transactions for a specific payer and date.
- Spend points using the rules above and return a list of `{ "payer": <string>, "points": <integer> }` for each call. 
- Return all payer point balances.

Note:
- We are not defining specific requests/responses. Defining these is part of the exercise.
- We don’t expect you to use any durable data store. Storing transactions in memory is acceptable for the exercise.

##### Example
Suppose you call your add transaction route with the following sequence of calls:
1. `{ "payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z" }`
2. `{ "payer": "UNILEVER", "points": 200, "timestamp": "2022-10-31T11:00:00Z" }`
3. `{ "payer": "DANNON", "points": -200, "timestamp": "2022-10-31T15:00:00Z" }`
4. `{ "payer": "MILLER COORS", "points": 10000, "timestamp": "2022-11-01T14:00:00Z" }`
5. `{ "payer": "DANNON", "points": 1000, "timestamp": "2022-11-02T14:00:00Z" }`

Then you call your spend points route with the following request: { "points": 5000 }
The expected response from the spend call would be (since Dannon had a previous spend record):
`[
  { "payer": "DANNON", "points": -100 },
  { "payer": "UNILEVER", "points": -200 },
  { "payer": "MILLER COORS", "points": -4,700 }
]`
A subsequent call to the points balance route, after the spend, should returns the following results:
`{
  "DANNON": 1000, ”UNILEVER” : 0, ,
  "MILLER COORS": 5300 
}`