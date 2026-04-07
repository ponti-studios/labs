import data from './data'

function sleep(data, delay) {
  return new Promise(resolve => setTimeout(() => resolve(data), delay))
}

export function getContacts() {
  return sleep(data, Math.random() * 1000)
}
