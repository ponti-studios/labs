'use strict'

const assert = require('assert')

const hapi = require('hapi')
const inert = require('inert')
const vision = require('vision')

const indexRoutes = require('./src/routes/index.routes')
const assetRoutes = require('./src/routes/asset.routes')
const bookRoutes = require('./src/routes/books')

const server = new hapi.Server()
server.connection({
  host: process.env.IP || 'localhost',
  port: process.env.PORT || (process.env.NODE_ENV === 'test' ? 3001 : 3000)
})

server.register([inert, vision], (err) => {
  assert(!err, err)

  server.route(indexRoutes)
  server.route(assetRoutes)
  server.route(bookRoutes)

  server.start((err) => {
    assert(!err, err)
    console.log(`Server running at: ${server.info.uri}`)
  })
})

module.exports = server
