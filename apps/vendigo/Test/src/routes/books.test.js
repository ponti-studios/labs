const server = require('../../index')
const expect = require('chai').expect
const books = require('../data/books.json')
const axios = require('axios')
const sinon = require('sinon')
const GreatExpectations = 'Great expectations'

function turnObjToArr () {
  return (
    Object
      .keys(books)
      .map(b => Object.assign({ uid: b }, books[b]))
  )
}

function getBookTitles (res) {
  return res.map(function (b) { return b.title })
}

describe('/books', () => {
  let sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    sandbox.stub(axios, 'get').returns(
      new Promise(function (resolve) {
        resolve({ data: books })
      })
    )
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should return books', () => {
    return (
      server
        .inject({ method: 'GET', url: '/books' })
        .then(response => {
          expect(getBookTitles(JSON.parse(response.payload))).to.deep.equal(
            getBookTitles(turnObjToArr())
          )
        })
    )
  })

  it('should return specific book if uid provided', () => {
    return (
      server
        .inject({ method: 'GET', url: '/books?search=OL24364628M' })
        .then(response => {
          expect(JSON.parse(response.payload)[0].title).to.equal(GreatExpectations)
        })
    )
  })

  it('should return specific book if title provided', () => {
    return (
      server
        .inject({ method: 'GET', url: '/books?search=Great expectations' })
        .then(response => {
          expect(JSON.parse(response.payload)[0].title).to.deep.equal(GreatExpectations)
        })
    )
  })

  it('should return specific book if author provided', () => {
    return (
      server
        .inject({ method: 'GET', url: '/books?search=Dicke' })
        .then(response => {
          const books = JSON.parse(response.payload)

          expect(books.length).to.deep.equal(2)

          expect(getBookTitles(books)).to.deep.equal([
            'Great expectations',
            'The adventures of Oliver Twist'
          ])
        })
    )
  })

  it('should return error if title provide but book not found', () => {
    return (
      server
        .inject({ method: 'GET', url: '/books?search=foo' })
        .then(response => {
          expect(JSON.parse(response.payload)).to.deep.equal({ error: 'book not found' })
        })
    )
  })
})
