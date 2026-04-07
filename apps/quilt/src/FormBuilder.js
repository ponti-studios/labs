import React, { Component } from 'react'
import PropTypes from 'prop-types'

class FormBuilder extends Component {
  state = {

  }

  static propTypes = {

  }

  async getFormFields() {
    return new Promise((res, rej) => {
      setTimeout(() => {
        this.setState({
          fields: [
            { label: 'First name', name: 'firstName', type: 'string', value: 'Joe' },
            { label: 'Last name', name: 'lastName', type: 'string' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Password', name: 'password', type: 'password' }
          ]
        })
        res()
      }, 1500)
    })
  }

  onFieldChange(e) {
    console.log(e.target.value)
  }

  getFormField(field) {
    let FormField

    switch (field.type) {
      case 'multi':
        FormField = (props) => (
          <select name={field.name} {...props}>
            {field.options.map(o => <option value={o.value}>{o.text}</option>)}
          </select>
        )
        break;
      default:
        FormField = (props) => (
          <input {...field} {...props} />
        )
    }

    return (
      <div className="field-group">
        <label htmlFor={field.name} style={{ textAlign: 'left' }}>{field.label}</label>
        <div>{<FormField onChange={this.onFieldChange} />}</div>
      </div>
    )
  }

  render() {
    const formFields =
    return (
      <form>
        {
          formFields.map(field => this.getFormField(field))
        }
      </form>
    )
  }
}

export default FormBuilder
