const express = require('express')
const router = express.Router()
const accruals = require('../data/accruals.json')
const statements = require('../data/statements.json')
const consts = require('../consts')
const utils = require('../utils')

function findAndUpdateStatement (accrual, balance) {
  const statementIndex = statements.findIndex(function (s) {
    return (
      utils.getTimeFromString(accrual.DATE) >= utils.getTimeFromString(s.START_DATE) &&
      utils.getTimeFromString(accrual.DATE) <= utils.getTimeFromString(s.END_DATE)
    )
  })

  if (statementIndex === -1) return

  const statement = statements[statementIndex]

  statements[statementIndex] = Object.assign({}, statement, {
    TOTAL: statement.TOTAL - (accrual.BALANCE - balance)
  })
}

router.get('/:date', function (req, res, next) {
  const accrual = accruals.find(function (a) {
    return a.DATE === req.params.date
  })

  // Return 404 & message if no accrual
  if (!accrual) return res.status(404).json(consts.ERROR_MESSAGE)

  // Return accrual
  return res.json(accrual)
})

router.get('/', function (req, res, next) {
  res.json(accruals)
})

router.post('/', function (req, res, next) {
  const accrual = req.body

  // Calculate accrual
  accrual.ACCRUAL = utils.getAccrual(accrual.BALANCE, accrual.RATE)

  // Add to DB
  accruals.push(accrual)

  findAndUpdateStatement(accrual, req.body.BALANCE)

  res.json({ accruals: accruals })
})

router.put('/', function (req, res, next) {
  // Get index of accrual
  const index = accruals.findIndex(function (a) {
    return a.DATE === req.body.DATE
  })

  // Return error if no accrual found
  if (index === -1) return res.status(404).json(consts.ERROR_MESSAGE)

  const accrual = accruals[index]
  const balance = req.body.BALANCE || accrual.BALANCE
  const rate = req.body.RATE || accrual.RATE

  // Add modified accrual to DB
  accruals[index] = Object.assign({}, req.body, {
    RATE: rate,
    BALANCE: balance,
    ACCRUAL: utils.getAccrual(balance, rate)
  })

  findAndUpdateStatement(accrual, req.body.BALANCE)

  res.json({ accruals: accruals })
})

module.exports = router
