import React from 'react'
import { shallow, render } from 'enzyme'
import axios from 'axios'
import { expect } from 'chai'
import sinon from 'sinon'
import App from './App'
import SearchBar from './SearchBar'

describe('App component', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    const resolved = new Promise((resolve) => resolve({ data: [] }))
    sandbox.stub(axios, 'get').returns(resolved)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should call /books', () => {
    shallow(<App/>)
    expect(axios.get.firstCall.args).to.deep.equal(['/books'])
  })

  it('should not contain Featured bar if no books', () => {
    const wrapper = shallow(<App/>)
    expect(wrapper.contains(<div className="featured">Featured</div>)).to.equal(false)
  })

  it('should contain Featured bar if books', () => {
    const wrapper = shallow(<App/>)
    wrapper.setState({ books: [{ title: 'foo' }] })
    expect(wrapper.contains(<div className="featured">Featured</div>)).to.equal(true)
  })

  it('should contain Search bar', () => {
    const wrapper = shallow(<App/>)
    expect(wrapper.find(SearchBar)).to.have.length(1)
  })

  it('should display error', () => {
    const wrapper = shallow(<App/>)
    wrapper.setState({ error: { error: 'Book not found' } })
    expect(wrapper.contains(
      <div className="alert alert-danger">
        Book not found
      </div>
    )).to.equal(true)
  })
})
