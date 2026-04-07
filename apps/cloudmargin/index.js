const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const PORT = 3000

// parse various different custom JSON types as JSON
app.use(bodyParser.json())

// parse an HTML body into a string
app.use(bodyParser.text())

app.use('/statements', require('./api/statements'))
app.use('/accruals', require('./api/accruals'))

app.use('/', function (req, res, next) {
  res.send('hello')
})

const server = require('http').createServer(app)

server.listen(PORT, function () {
  console.log('ready to go!') // eslint-disable-line
})

/**
 * TODO GET /statement?from=DATE&to=DATE
 * * Should provide a sum of all accruals between dates
 */

module.exports = server
