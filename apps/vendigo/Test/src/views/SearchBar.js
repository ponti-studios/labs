import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import './SearchBar.css'
class SearchBar extends Component {
  state = {

  }

  static propTypes = {
    onSearch: PropTypes.func.isRequired
  }

  /**
   * @param {Event}
   */
  onKeyUp = (evt) => {
    if (evt.keyCode === 13) {
      axios
        .get('/books', this.state.value === '' ? {} : { params: { search: this.state.value } })
        .then(({ data }) => {
          this.props.onSearch(null, data)
        })
        .catch(({ response: { data } }) => {
          this.props.onSearch(data)
        })
    }
  }

  onChange = ({ target: { value } }) => {
    this.setState({ value })
  }

  render () {
    const { value } = this.state

    return (
      <div className="searchBar col-sm-12">
        <input
          type="text"
          onChange={this.onChange}
          onKeyUp={this.onKeyUp}
          value={value || ''}
          placeholder="Search by title, author, or uid"
        />
      </div>
    )
  }
}

export default SearchBar
