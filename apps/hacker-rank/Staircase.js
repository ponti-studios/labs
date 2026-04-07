/**
 * Consider a staircase of size :
 * ```
 *     #
 *    ##
 *   ###
 *  ####
 * ```
 * 
 * Observe that its base and height are both equal to `n`, and the image is drawn using `#` 
 * symbols and spaces. The last line is not preceded by any spaces.
 * 
 * Write a program that prints a staircase of size `n`.
 */
function main (n) {
  // var n = parseInt(readLine());

  for (var i = 1; i <= n; i++) {
    // NOTE: Must `+ 1` because join will only be for the in betweens
    console.log(Array(n - i + 1).join(' ') + Array(i + 1).join('#'))
  }
}

main(6)
