function main(n, a) {    
    // The desired boxes: [0, 0], [1, 1], [2, 2]
    var diagonal1 = []

    // The desired boxes: [0, 2], [1, 1], [2, 0]
    var diagonal2 = []
    
    /**
     * The index of the furthest cell in a row (Arrays start at 0)
     * @type {Number}
     */
    var maximumCellIndex = n - 1
    
    for (var i = 0; i <= maximumCellIndex; i++) {
        // [0, 0]
        // [1, 1]
        // [2, 2]
        diagonal1.push(a[i][i])

        // [0, (2 - 0 = 2)]
        // [1, (2 - 1 = 1)]
        // [2, (2 - 2 = 0)]
        diagonal2.push(a[i][maximumCellIndex - i])
    }
     
    function arraySum (a) {
      return a.reduce(function(a, b) { return a + b }, 0)
    } 

    return Math.abs(arraySum(diagonal1) - arraySum(diagonal2))
}

console.log(main(
  3,
  [
    [ 11, 2, 4 ],
    [ 4, 5, 6],
    [10, 8, -12]
  ]
))