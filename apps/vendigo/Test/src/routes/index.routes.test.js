const server = require('../../index')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

describe('index.routes', () => {
  it('should return 200', (done) => {
    server.inject({ method: 'GET', url: '/' })
      .then(response => {
        expect(response.statusCode).to.equal(200)
        fs.readFile(path.resolve(__dirname, '../views/index.html'), 'utf8', function (oErr, sText) {
          expect(response.payload).to.equal(sText)
          done()
        })
      })
  })
})
