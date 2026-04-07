function processData (input) {
  var args = input.split('\n')
  var array = args[1].split(' ')
  var value = array[array.length - 1]
  var i = array.length - 2
  var notIn = true

  while (notIn) {
    if (array[i] > value) {
      // If current index is greater than value, shift to right
      array[i + 1] = array[i]
    } else if (array[i] < value || i === -1) {
      // If current index is less than value or we've exited array, insert value
      array[i + 1] = value
      notIn = false
    }

    console.log(array.join(' '))

    i = array[i] < value ? 0 : i - 1
  }
}

// console.log(
//   processData(
//     '14\n' +
//     '1 3 5 9 13 22 27 35 46 51 55 83 87 23'
//   )
// )

console.log(
  processData(
    '10\n' +
    '2 3 4 5 6 7 8 9 10 1'
  )
)
