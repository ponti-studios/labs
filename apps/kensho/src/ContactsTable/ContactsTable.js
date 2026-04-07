import * as React from 'react'
import PropTypes from 'prop-types'
import { HTMLTable } from '@blueprintjs/core'
import HeaderCell from './HeaderCell'

export default class ContactsTable extends React.Component {
  static propTypes = {
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        key: PropTypes.string,
        type: PropTypes.oneOf(['category', 'number', 'string']),
      })
    ),
    contacts: PropTypes.arrayOf(PropTypes.object),
  }

  constructor(props) {
    super(props);

    this.state = {
      // Construct filters based on the names of the columns available
      filters: this.props.columns.reduce(
        (a, b) => ({ ...a, [b.key]: '' }),
        {}
      )
    }
  }

  handleFilter = column => event => {
    this.setState({
      filters: {
        ...this.state.filters,
        [column]: event.target.value
      }
    })
  }

  doesContactContainFilter(contact, filterName) {
    const value = this.state.filters[filterName]

    return value === ''
      ? true
      : (contact[filterName] + '').toUpperCase().includes(value.toUpperCase())
  }

  filteredContacts() {
    const { contacts } = this.props

    const filtered = contacts.filter(contact => {
      const map = Object
        .keys(this.state.filters)
        .map((filterName) => this.doesContactContainFilter(contact, filterName))

      // Only return contact if all filters match
      return !map.includes(false)
    })

    return filtered
  }

  removeFilter(filter) {
    return () => this.setState({
      filters: {
        ...this.state.filters,
        [filter]: ''
      }
    })
  }

  render() {
    const { filters } = this.state
    const { columns } = this.props

    return (
      <HTMLTable striped interactive className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        <thead>
          <tr>
            <td colSpan={columns.length}>
              {Object.keys(filters).map(f => filters[f] !== '').includes(true) && (
                <div style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '0.5rem', borderBottom: '1px solid black' }}>
                  Current Filters
                </div>
              )}
              {Object.keys(filters).map((filter) => (
                filters[filter] !== '' ?
                  (
                    <div key={filter} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ marginRight: '1rem' }}>
                        <b>{filter.toUpperCase()}</b> : {filters[filter] === '' ? 'N/A' : filters[filter]}
                      </span>
                      {filters[filter] !== '' && (
                        <button
                          className="button is-danger"
                          onClick={this.removeFilter(filter)}
                        >
                          Remove
                          </button>
                      )
                      }
                    </div>
                  )
                  : null
              ))}
            </td>
          </tr>
          <tr>
            {columns.map((col, index) => (
              <HeaderCell
                filter={filters[col.key]}
                onFilter={this.handleFilter(col.key)}
                key={index}
                {...col}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {this.filteredContacts().map(contact => (
            <tr key={contact.phone}>
              {columns.map(column => <td key={column.key}>{contact[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    )
  }
}
