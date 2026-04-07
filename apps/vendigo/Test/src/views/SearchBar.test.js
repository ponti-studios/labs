import React from 'react'
import { mount } from 'enzyme'
import { expect } from 'chai'
import sinon from 'sinon'
import axios from 'axios'
import SearchBar from './SearchBar'

describe('SearchBar', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should call axios.get on enter', () => {
    const obj = { onSearch (value) {} }
    const wrapper = mount(<SearchBar onSearch={obj.onSearch}/>)
    sandbox.stub(axios, 'get').returns(new Promise((resolve) => resolve({ data: [] })))
    sandbox.stub(obj, 'onSearch').callThrough()

    wrapper.find('input').simulate('keyUp', {
      keyCode: 13,
      target: {
        value: 'foo'
      }
    })

    expect(axios.get.called).to.equal(true)
  })

  it('should not call axios.get if not enter', () => {
    const obj = { onSearch (value) {} }
    const wrapper = mount(<SearchBar onSearch={obj.onSearch}/>)

    sandbox.stub(axios, 'get').returns(new Promise((resolve) => resolve({ data: [] })))
    sandbox.stub(obj, 'onSearch').callThrough()

    wrapper.find('input').simulate('keyUp', {
      keyCode: 34,
      target: {
        value: 'foo'
      }
    })

    expect(axios.get.called).to.equal(false)
  })
})
