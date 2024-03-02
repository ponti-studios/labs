var request = require('supertest')

describe('Server', function () {
  var server

  beforeEach(function serverBeforeEach () {
    server = require('../index')
  })

  afterEach(function serverAfterEach (done) {
    server.close(done)
  })

  it('responds to /', function testHome () {
    return (
      request(server)
        .get('/')
        .expect(200)
        .then(function (response) {
          expect(response.text).toEqual('hello')
        })
    )
  })
})
