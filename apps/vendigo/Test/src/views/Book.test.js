import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import Book from './Book'

describe('Book', () => {
  const book = {
    title: 'Foo Bar',
    uid: 'OLID:012345',
    authors: [
      { name: 'Ben Franklin' }
    ]
  }

  it('should render book properties', () => {
    const wrapper = shallow(<Book book={{ ...book }} />)
    // Render title
    expect(wrapper.contains(<div className="book-title red-text bold" title="Foo Bar">Foo Bar</div>)).to.equal(true)
    // Render uid
    expect(wrapper.contains(<div className="uid">012345</div>)).to.equal(true)
  })

  it('should not add image if no medium size', () => {
    const wrapper = shallow(<Book book={{ ...book, cover: { small: 'foo' } }} />)
    expect(wrapper.contains(<img alt="cover of Foo Bar" src="foo" />)).to.equal(false)
  })

  it('should add image if no medium size', () => {
    const wrapper = shallow(<Book book={{ ...book, cover: { medium: 'foo' } }} />)
    expect(wrapper.contains(<img alt="cover of Foo Bar" src="foo" />)).to.equal(true)
  })
})
