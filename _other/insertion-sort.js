/**
 *
 * @bigO {n^2} This is because the you have to hit every element and then might have to move
 * every element beneath it
 * @param {array} array
 * @returns {array} Original array sorted
 */
function insertionSort (array) {
  for (var i = 1; i < array.length; i++) {
    var index = i
    var current = array[i]

    while (index > -1 && array[index - 1] > current) {
      array[index] = array[index - 1]
      index--
    }

    array[index] = current
  }

  return array
}

function insertionSortFunctional (array) {
  return array.reduce(function (newArray, element, index) {
    let i = index

    while (i >= 0 && newArray[i - 1] > element) {
      newArray[i] = newArray[i - 1]
      i--
    }

    newArray[i] = element

    return newArray
  }, [])
}

function selectionSort (array) {
  for (var i = 0; i < array.length; i++) {
    let minIndex = i
    let minValue = array[i]
    let index = i + 1

    while (index < array.length) {
      if (array[index] < minValue) {
        minIndex = index
        minValue = array[index]
      }
      index++
    }

    let temp = array[minIndex]
    array[minIndex] = array[i]
    array[i] = temp
  }

  return array
}

function getMinimum (array, start) {
  let minIndex = start
  let minValue = array[start]
  var i = start + 1

  while (i < array.length) {
    if (array[i] < minValue) {
      minIndex = i
      minValue = array[i]
    }
    i++
  }

  return minIndex
}

/**
 *
 *
 * @param {array} array
 * @param {boolean} getIndex
 * @returns
 */
function findLargest (array, getIndex) {
  let maxValue = array[0]
  let maxIndex = 0
  let index = 1

  while (index < array.length) {
    if (array[index] > maxValue) {
      maxValue = array[index]
      maxIndex = index
    }
    index++
  }

  return getIndex ? maxIndex : maxValue
}

// console.log(insertionSort([1, 10, 4, 8, 11, 5, 25, 3, 52, 2, 0]))
console.log(getMinimum([1, 10, 4, 8, 11, 5, 0, 25, 3, 52, 2], 0))
console.log(selectionSort([1, 10, 4, 8, 11, 5, 0, 25, 3, 52, 2], 0))
console.log(findLargest([1, 10, 4, 8, 11, 5, 0, 25, 3, 52, 2]))
console.log(insertionSortFunctional([1, 10, 4, 8, 11, 5, 0, 25, 3, 52, 2]))
