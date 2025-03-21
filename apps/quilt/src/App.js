import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import FormBuilder from './FormBuilder';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <FormBuilder />
        </header>
      </div>
    );
  }
}

export default App;
