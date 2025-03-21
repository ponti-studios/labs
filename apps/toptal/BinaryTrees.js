const binaryTree = {
  x: 5,
  l: {
    x: 3,
    l: {
      x: 20,
      l: [Object],
      r: null
    },
    r: null
  },
  r: {
    x: 10,
    l: { x: 1, l: null, r: null },
    r: { x: 15, l: [Object], r: [Object] }
  }
}

function solution (T) {
  return Object.keys(T).map(function (item) {
    return {
      l: item.l != null ? solution(item.l) : 0,
      r: item.r != null ? solution(item.r) : 0
    }
  })
}

console.log(solution(binaryTree)) // eslint-disable-line
