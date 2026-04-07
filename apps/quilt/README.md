# Quilt Test

- GUI (CMS?) for Prod Managers to pick form fields
- This generates a JSON object which the form ui will use to determine what to
render

- form
  - componentWillMount - making API request for form structure
  - render loading while retrieving
  - when recieved
    - cycle through the form fields using a switch on the form field `.type` property


const formFieldTypes = [
  'string',
  'email',
  'number',
  'password'
]

const formField = {
  label: String,
  name: String,
  type: String,
  value: any,
  options: [
    { value: String, text: String }
  ]
}

const formFields = [
  { fieldName: 'First name', type: 'string', default: 'Joe' },
  { fieldName: 'Last name', type: 'string' },
  { fieldName: 'email', type: 'email' }
]


