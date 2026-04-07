const express = require('express')
const router = express.Router()
const statements = require('../data/statements.json')
const consts = require('../consts')

router.get('/', function (req, res, next) {
  res.status(200).json(statements)
})

router.put('/', function (req, res, next) {
  const index = statements.findIndex(function (s) {
    return (
      s.START_DATE === req.body.START_DATE &&
      s.END_DATE === req.body.END_DATE
    )
  })

  if (index === -1) return res.status(404).json(consts.ERROR_MESSAGE)

  const statement = statements[index]

  statements[index] = Object.assign({}, statement, req.body, {
    TOTAL: statement.TOTAL - req.body.AMENDMENT
  })

  res.json({ statement: statement })
})
module.exports = router
