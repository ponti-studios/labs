/**
 * ## Task
 * The purpose of this test was to create a function that would operate as so:
 * 
 * ```
 * f()()("l") // => "ool"
 * f()()()()("a") // => "ooooa"
 * ```
 * 
 * ## Implementation
 * * Create a closure with a variable that maintains state
 * * Every time the return function is executed add an "o" to the state
 * * If an argument is supplied, return the current state with the argument added at the end
 * * If no argument is supplied, return the return function
 * @param {String} input 
 */
/*
 * Complete the function below.
 */
function f (input) {
  var state = 'f'

  function q (input) {
    /**
       * If an input is supplied, return the 
       * current state plus input
       */
    if (input) {
      // Add input to current state
      state += input
      return state
    } else {
      /**
         * If no input, increment state and return q
         */
      state += 'o'
      return q
    }
  }

  return q(input)
}
