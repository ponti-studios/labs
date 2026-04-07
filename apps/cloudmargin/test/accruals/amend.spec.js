const request = require('supertest')
const consts = require('../../consts')

describe('Accruals: Amend', function () {
  let server

  beforeEach(function accrualsAmendBeforeEach () {
    server = require('../../index')
  })

  afterEach(function accrualsAmendAfterEach (done) {
    server.close(done)
  })

  it('should return an error & 404 if cannot find accrual', function () {
    return (
      request(server)
        .put('/accruals')
        .send({ DATE: '2017-05-05', BALANCE: 5000, RATE: 0.2 })
        .expect(404)
        .then(function (response) {
          expect(response.body).toEqual(consts.ERROR_MESSAGE)
        })
    )
  })

  it('should edit an accrual', function (done) {
    const agent = request(server)

    agent
      .put('/accruals')
      .send({ DATE: '2017-01-01', BALANCE: 5000, RATE: 0.2 })
      .expect(200)
      .end(function () {
        agent
          .get('/accruals')
          .expect(200)
          .end(function (err, response) {
            const accrual = response.body[0]

            expect(response.body.length).toEqual(5)
            expect(accrual.DATE).toEqual('2017-01-01')
            expect(accrual.BALANCE).toEqual(5000)
            expect(accrual.RATE).toEqual(0.2)
            expect(accrual.ACCRUAL).toEqual(1000)
            done(err)
          })
      })
  })

  it('should allow for partial edits to an accrual', function (done) {
    const agent = request(server)

    agent
      .put('/accruals')
      .send({ DATE: '2017-01-01', BALANCE: 2000 })
      .expect(200)
      .end(function () {
        agent
          .get('/accruals')
          .expect(200)
          .end(function (err, response) {
            const accrual = response.body[0]

            expect(response.body.length).toEqual(5)
            expect(accrual.DATE).toEqual('2017-01-01')
            expect(accrual.BALANCE).toEqual(2000)
            expect(accrual.RATE).toEqual(0.2)
            expect(accrual.ACCRUAL).toEqual(400)
            done(err)
          })
      })
  })
})
