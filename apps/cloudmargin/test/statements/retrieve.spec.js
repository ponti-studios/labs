const request = require('supertest')

describe('Statements: Amend', function () {
  let server
  let statements

  beforeEach(function accrualsAmendBeforeEach () {
    server = require('../../index')
    statements = require('../../data/statements.json')
  })

  afterEach(function accrualsAmendAfterEach (done) {
    server.close(done)
    statements = void 0
  })

  it('should retrieve statements', function () {
    return (
      request(server)
        .get('/statements')
        .expect(200)
        .then(function (response) {
          expect(response.body).toEqual(statements)
        })
    )
  })
})
