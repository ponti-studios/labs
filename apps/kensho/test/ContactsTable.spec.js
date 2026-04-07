// Link.react.test.js
import React from 'react';
import ContactsTable from '../src/ContactsTable/ContactsTable';
import { shallow } from 'enzyme'
import data from '../src/data'

const mocks = [{
  "age": 35,
  "city": "Maquanzhen",
  "name": "Gwen Garrick",
  "phone": "776-878-8338"
}, {
  "age": 40,
  "city": "General Lavalle",
  "name": "Carmella Brunker",
  "phone": "922-694-8628"
}, {
  "age": 2,
  "city": "Xinba",
  "name": "Abbot Delahunt",
  "phone": "327-542-4874"
}, {
  "age": 7,
  "city": "Mlaka pri Kranju",
  "name": "Lucine Stratz",
  "phone": "422-562-2609"
}, {
  "age": 98,
  "city": "Kamenický Šenov",
  "name": "Ethe Tomankiewicz",
  "phone": "580-701-9078"
}]

test('Displays data', () => {
  const tree = shallow(
    <ContactsTable columns={data.metadata.columns} contacts={mocks} />
  );
  expect(tree).toMatchSnapshot();
});

test('Sort data by name', () => {
  const tree = shallow(
    <ContactsTable columns={data.metadata.columns} contacts={mocks} />
  );
  tree.setState({ filters: { name: 'mell' } })
  expect(tree).toMatchSnapshot();
})

test('Sort data by age', () => {
  const tree = shallow(
    <ContactsTable columns={data.metadata.columns} contacts={mocks} />
  );
  tree.setState({ filters: { age: '35' } })
  expect(tree).toMatchSnapshot();
})

test('Sort data by city', () => {
  const tree = shallow(
    <ContactsTable columns={data.metadata.columns} contacts={mocks} />
  );
  tree.setState({ filters: { city: 'xin' } })
  expect(tree).toMatchSnapshot();
})

test('Sort data by phone', () => {
  const tree = shallow(
    <ContactsTable columns={data.metadata.columns} contacts={mocks} />
  );
  tree.setState({ filters: { phone: '562' } })
  expect(tree).toMatchSnapshot();
})

test('Remove phone filter', () => {
  const tree = shallow(
    <ContactsTable columns={data.metadata.columns} contacts={mocks} />
  );
  tree.setState({ filters: { phone: '562' } })
  expect(tree).toMatchSnapshot();

  tree.setState({ filters: { phone: '' } })
  expect(tree).toMatchSnapshot();
})
