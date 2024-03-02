import * as React from 'react'
import { render } from 'react-dom'

import ContactsTable from './ContactsTable'
import './styles.css'
import 'bulma/css/bulma.min.css';
import NavBar from './NavBar';

const root = document.createElement('div')
document.body.appendChild(root)

class App extends React.Component {
  render() {
    return (
      <div>
        <NavBar></NavBar>
        <ContactsTable />
      </div>
    )
  }
}

render(<App />, root)
