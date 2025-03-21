const request = require('supertest')

describe('Statements: Amend', function () {
  let server

  beforeEach(function accrualsAmendBeforeEach () {
    server = require('../../index')
  })

  afterEach(function accrualsAmendAfterEach (done) {
    server.close(done)
  })

  it('should amend a statement', function (done) {
    const agent = request(server)

    agent
      .put('/statements')
      .send({
        AMENDMENT: -200,
        START_DATE: '2017-02-01',
        END_DATE: '2017-02-28'
      })
      .expect(200)
      .end(function () {
        agent
          .get('/statements')
          .end(function (err, response) {
            const statement = response.body[1]
            expect(response.body.length).toEqual(3)
            expect(statement.AMENDMENT).toEqual(-200)
            expect(statement.TOTAL).toEqual(200)
            done(err)
          })
      })
  })
})
