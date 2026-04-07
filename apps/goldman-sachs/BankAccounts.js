process.stdin.resume()
process.stdin.setEncoding('ascii')

var input_stdin = ''
var input_stdin_array = ''
var input_currentline = 0

process.stdin.on('data', function (data) {
  input_stdin += data
})

process.stdin.on('end', function () {
  input_stdin_array = input_stdin.split('\n')
  main()
})

function readLine () {
  return input_stdin_array[input_currentline++]
}

/// //////////// ignore above this line ////////////////////

function feeOrUpfront (numOfPayments, basePayment, x, upfront, payments) {
  // Complete this function
  var percentage = x / 100

  var withPercentage = payments.reduce(function (a, p) {
    p = p * percentage
    // The bank will charge either the basePayment 
    // or the percentage of the payment, whichever 
    // is greater.
    return a + (p >= basePayment ? p : basePayment)
  }, 0)

  return upfront < withPercentage ? 'upfront' : 'fee'
}

function main () {
  var q = parseInt(readLine())
  for (var a0 = 0; a0 < q; a0++) {
    var n_temp = readLine().split(' ')
    var n = parseInt(n_temp[0])
    var k = parseInt(n_temp[1])
    var x = parseInt(n_temp[2])
    var d = parseInt(n_temp[3])
    var p = readLine().split(' ')
    p = p.map(Number)
    var result = feeOrUpfront(n, k, x, d, p)
    process.stdout.write('' + result + '\n')
  }
}
