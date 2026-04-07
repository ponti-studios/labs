const yargs = require('yargs')

/**
 * Determine if a number is prime
 * 
 * @param {number} n - Number to check if is prime
 * @returns {boolean}
 */
function isPrime (n) {
  /**
   * a * b = b
   * a => a < sqrt(n) || a > sqrt(n)
   * b => b < sqrt(n) || b > sqrt(n)
   */
  const sqrt = Math.floor(Math.sqrt(n))

  /**
   * We want to start with 2 because all numbers are divisible by
   * 1 and divisibility by 1 is a prime factor base case. We also
   * want to start at 2 and work our way upwards instead of moving
   * backwards because we will do far fewer iterations.
   * 
   * For example, for the number `15485862`, if we start at sqrt and 
   * work our backwards we would have to perform 3642 iterations berfore 
   * determining that it is not a prime number. By starting at 2, we only
   * have to perform 1 iteration.
   * 
   * Then we will continue until we reach the sqrt of the n defined above.
   */
  for (var i = 2; i <= sqrt; i++) {
    /**
     * If there is no remainder, then the number `n` is divisible 
     * by a number smaller than itself. Therefore it is not prime.
     */
    if (n % i === 0) return false
  }

  /**
   * If the number is not found to be divisible by any number smaller
   * than itself then it is a prime number.
   */
  return true
}

if (require.main === module) {
  console.log(isPrime(Number(yargs.argv.n)))
}

module.exports = isPrime
