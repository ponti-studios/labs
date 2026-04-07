import * as React from 'react'
import PropTypes from 'prop-types'
import { Button, InputGroup, Popover } from '@blueprintjs/core'

export default function HeaderCell(props) {
  return (
    <th className="headerCell">
      {props.name}
      <Popover>
        <Button icon="filter" minimal />
        <InputGroup
          value={props.filter}
          onChange={props.onFilter}
          placeholder="Filter Rows"
          leftIcon="filter"
          autoFocus
        />
      </Popover>
    </th>
  )
}

HeaderCell.propTypes = {
  name: PropTypes.string,
  filter: PropTypes.string,
  onFilter: PropTypes.func,
  type: PropTypes.oneOf(['category', 'number', 'string']),
}
