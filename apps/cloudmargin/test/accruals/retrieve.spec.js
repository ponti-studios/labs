const request = require('supertest')
const consts = require('../../consts')

describe('Accruals: Retrieve', function () {
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

  it('should return json of accruals', function () {
    return (
      request(server)
        .get('/accruals')
        .expect(200)
        .then(function (response) {
          expect(response.body).toEqual(accruals)
        })
    )
  })

  it('should return specific accrual', function () {
    return (
      request(server)
        .get('/accruals/2017-01-01')
        .expect(200)
        .then(function (response) {
          const accrual = response.body
          expect(accrual).toEqual(accruals[0])
        })
    )
  })

  it('should return an error & 404 if cannot find accrual', function () {
    return (
      request(server)
        .get('/accruals/2017-05-05')
        .expect(404)
        .then(function (response) {
          expect(response.body).toEqual(consts.ERROR_MESSAGE)
        })
    )
  })
})
