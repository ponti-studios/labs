/**
 * Write a function called ​sum_common_prefix_length​ that takes a string as its input. Given that string, split the string into two substrings at every possible point.
 * 
 * The rightmost substring is the ​suffix​. The beginning of the string is the ​prefix​.
 * 
 * Determine the lengths of the common prefix between each suffix and the original string. Return the sum of the lengths of the common prefixes.
 * 
 * Example:
    sum_common_prefix_length​(​'abcabcd') == 10
 */

 /**
  * @param {string} input String to find common prefixes
  * @returns {number}
  */
 function sumCommonPrefixLength(input) {
     /**
      * Depleting elements of input
      * @type {[string]}
      */
     const inputArray = input.split('')

     /**
      * @description Sum of common prefixes
      * 
      * We start with a score of the length of the input because
      * the initial prefix has no length, so any input would match
      * this prefix
      * 
      * @type {number}
      */
     let score = input.length

     /**
      * Store of elements removed from the front of `inputArray`
      * @type {string}
      */
     let prefix = ''
    
    //  Iterate the input string
    for (let i = 0; i < input.length; i++) {
        // Remove item from inputArray and add to prefix
        prefix += inputArray.shift()
        
        // If prefix is at the front of the inputArray, add length of prefix to score
        // Else add 0
        score += ( inputArray.join('').indexOf(prefix) === 0 ? prefix.length : 0 )
    }

    return score
 }

module.exports = sumCommonPrefixLength