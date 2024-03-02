const request = require('supertest')

describe('Accruals: Insert', function () {
  let server
  let accruals

  beforeEach(function accrualsAmendBeforeEach () {
    server = require('../../index')
    accruals = require('../../data/accruals.json')
  })

  afterEach(function accrualsAmendAfterEach (done) {
    server.close(done)
    accruals = void 0
  })

  it('should add accrual', function (done) {
    const accrual = {
      'DATE': '2017-04-04',
      'RATE': 0.6,
      'BALANCE': 20000
    }

    const agent = request(server)

    return (
      agent
        .post('/accruals')
        .send(accrual)
        .expect(200)
        .end(function () {
          agent
            .get('/accruals')
            .expect(200)
            .end(function (err, response) {
              const accruals = response.body
              const last = accruals[accruals.length - 1]

              expect(accruals.length).toEqual(6)
              expect(last.DATE).toEqual('2017-04-04')
              expect(last.RATE).toEqual(0.6)
              expect(last.BALANCE).toEqual(20000)
              expect(last.ACCRUAL).toEqual(12000)

              done(err)
            })
        })
    )
  })

  it('should update corresponding statement', function (done) {
    const accrual = {
      'DATE': '2017-01-01',
      'RATE': 0.5,
      'BALANCE': 5000
    }

    const agent = request(server)

    return (
      agent
        .post('/accruals')
        .send(accrual)
        .expect(200)
        .end(function () {
          agent
            .get('/statements')
            .expect(200)
            .end(function (err, response) {
              const statement = response.body[0]
              expect(statement.TOTAL).toEqual(10200)
              done(err)
            })
        })
    )
  })
})
