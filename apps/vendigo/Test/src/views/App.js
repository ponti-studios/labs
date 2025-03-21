import React, { Component } from 'react'
import axios from 'axios'
import Book from './Book'
import SearchBar from './SearchBar'
import './App.css'

class App extends Component {
  state = {
    books: []
  }

  onBookSearch = (error, books) => {
    this.setState({ error, books })
  }

  componentWillMount () {
    axios.get('/books').then(({ data: books }) => {
      this.setState({ books })
    })
  }

  render () {
    const { books, error } = this.state

    return (
      <div className="container">
        <header>
          Book Shop
        </header>
        {
          error &&
          (
            <div className="col-sm-12">
              <div className="alert alert-danger">
                {error.error}
              </div>
            </div>
          )
        }
        <SearchBar onSearch={this.onBookSearch} />
        { !error && books.length &&
          (
            <div className="col-sm-12">
              <div className="featured">Featured</div>
            </div>
          )
        }
        <div className="col-sm-12">

          {books && books.map((book, i) => (
            <div key={i} className="col-sm-4">
              <Book book={book} />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default App
