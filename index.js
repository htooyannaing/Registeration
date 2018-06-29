const express = require('express')
const { mongoose } = require('./services/db/mongo_connect')
const bodyParser = require('body-parser')
const authRourte = require('./route/auth_route')

const app = express()

app.use(bodyParser.json())
app.use('/api', authRourte)

app.listen(5000, () => console.log("Server is running on port", 5000))