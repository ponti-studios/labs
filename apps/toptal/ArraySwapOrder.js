// you can write to stdout for debugging purposes, e.g.
// console.log('this is a debug message');

var array = [1, 5, 3, 3, 7]

const isInOrder = data => {
  for (var i = 0; i < data.length - 1; i++) {
    if (data[i] > data[i + 1]) {
      return false
    }
  }

  return true
}

// A.length === N
// 0 <= I <= J < N; A[I] && A[J]
// Non-desc order 
function solution (A) {
  // The array is already sorted.
  if (isInOrder(A)) return true

  for (var i = 1; i < A.length; ++i) {
    // Look for an inverted adjacent pair.
    if (A[i - 1] <= A[i]) continue

    // Get element
    const x = A[i - 1]
    let left = i - 1

    while (left - 1 >= 0 && A[left - 1] === x) {
      --left
    }

    for (++i; i < A.length; ++i) {
      if (A[i] >= x) break
    }

    A[left] = A[i - 1]
    A[i - 1] = x

    // Check if array is in order
    return isInOrder(A)
  }
}

console.log(solution(array))
