function processData (input) {
  var args = input.split('\n')
  var array = args[1].split(' ').map(x => parseInt(x, 10))

  /**
   * Looping through array
   * 
   * We are starting with the second element (array[1]), because we are 
   * treating the first element as though it were part of a 
   * new "sorted" array.
   */
  for (let i = 1; i < array.length; i++) {
    let element = array[i]
    let index = i

    while (index > 0 && array[index - 1] > element) {
      array[index] = array[index - 1]
      index--
    }

    array[index] = element

    console.log(array.join(' '))
  }
}

console.log(
  processData(
    '6\n' +
    '1 4 3 5 6 2'
  )
)
