const yargs = require('yargs')

/**
 * Determine if a string is a palindrome using a `while` loop.
 * 
 * @param {string} str 
 * @returns {boolean}
 */
function isPalindrome (str) {
  /**
   * @type {number}
   */
  var size = str.length

  /**
   * @type {number}
   */
  var i = 0

  /**
   * @type {boolean}
   */
  var search = size / 2 - (size % 2 !== 0 ? 1 : 0)

  /**
   * @type {boolean}
   */
  var flag = true

  while (i < search && flag === true) {
    /**
     * Test the first and last letter. Each iteraton of this 
     * `while` loop with move further inwards until it has reached
     * the middle letter for a string with an odd length or finished
     * testing each side for a string with an even length.
     */
    if (str[i] !== str[size - 1 - i]) flag = false

    /**
     * Increment `i` to move next loop inwards
     */
    i++
  }

  return flag
}

/**
 * Determine if a string is a palindrome using recursion.
 * 
 * @param {string} str 
 * @returns {boolean}
 */
function isPalindromeRecursive (str) {
  /**
   * A single letter is a palidrome and no letters is a palindrome
   */
  if (str.length === 0 || str.length === 1) return true

  /**
   * A palindrome requires that the beginning and last letters are
   * the same. If they are not, the `str` is not a palindrome
   */
  if (str.slice(0, 1) !== str.slice(-1)) return false

  /**
   * If the `str` is longer than 1 letter and the first and last letter
   * are the same, we want to run the same tests above on the segment
   * of the `str` within the bounds of the first and last letter since 
   * we have already tested them.
   */
  return isPalindrome(str.slice(1, -1))
}

if (require.main === module) {
  console.log(isPalindromeRecursive(yargs.argv.word))
}

module.exports = {
  isPalindrome,
  isPalindromeRecursive
}
