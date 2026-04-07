/**
 * Given an array of integers, calculate which fraction of its elements are positive, 
 * which fraction of its elements are negative, and which fraction of its elements are 
 * zeroes, respectively. Print the decimal value of each fraction on a new line.
 * 
 * Note: This challenge introduces precision problems. The test cases are scaled to six 
 * decimal places, though answers with absolute error of up to `10^-4` are acceptable.
 */

function main (n, arr) {
  // var n = parseInt(readLine());
  // arr = readLine().split(' ');
  // arr = arr.map(Number);
  var positive = []
  var negative = []
  var zeroes = []

  for (var i = 0; i < arr.length; i++) {
    if (arr[i] < 0) negative.push(arr[i])
    else if (arr[i] > 0) positive.push(arr[i])
    else if (arr[i] === 0) zeroes.push(arr[i])
  }

  var getAvg = function (c) {
    return c.length / n
  }

  console.log(getAvg(positive))
  console.log(getAvg(negative))
  console.log(getAvg(zeroes))
}

main(6, [-4, 3, -9, 0, 4, 1])
