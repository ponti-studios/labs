const array = '1 4 3 5 6 2'.split(' ')

function sortArr (arr) {
  let index = 0

  while (index < arr.length) {
    let i = indexOfMinimum(arr, index)
    let temp = arr[i]
    arr[i] = arr[index]
    arr[index] = temp
    index++
  }

  return arr
}

function indexOfMinimum (arr, start) {
  let min = arr[0]
  let index = start
  let i = start

  while (i < arr.length) {
    if (arr[i] < min) {
      min = arr[i]
      index = i
    }
    i++
  }

  return index
}

console.log(sortArr(array))
