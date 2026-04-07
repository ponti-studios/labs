require('babel-register')()
require('ignore-styles')

var JSDOM = require('jsdom').JSDOM

var exposedProperties = ['window', 'navigator', 'document']

var jsdom = new JSDOM('')

global.window = jsdom.window

global.document = window.document

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property)
    global[property] = document.defaultView[property]
  }
})

global.navigator = {
  userAgent: 'node.js'
}

documentRef = document
