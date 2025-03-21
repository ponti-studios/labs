import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './Book.css'

class Book extends Component {
  static propTypes = {
    book: PropTypes.object.isRequired
  }

  render () {
    const { title, cover, authors, uid } = this.props.book

    return (
      <div className="book">
        <div className="cover">
          { cover && cover.medium && <img alt={`cover of ${title}`} src={cover.medium} />}
        </div>

        <div
          className="book-title red-text bold"
          // Add title so that full title is displayed on mouseover since 
          // text is being clipped
          title={title}
        >
          {title}
        </div>

        <div>
          By <span className="red-text bold">{authors[0].name}</span>
        </div>

        <div className="uid">
          {uid.replace('OLID:', '')}
        </div>

        <div className="row">
          <div className="price col-sm-6 text-center">
            $ {(Math.random() * 100).toFixed(2)}
          </div>
          <div className="col-sm-6 text-center">
            <button className="btn btn-default">
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Book
