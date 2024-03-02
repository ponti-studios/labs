/*
 * Complete the function below.
 */
function charMap (input) {
  var map = {}

  if (input.length === 0) return {}

  for (var i = 0; i < input.length; i++) {
    var letter = input[i].toLowerCase()

    if (/[a-z]/.test(letter)) {
      var current = map[letter]
      map[letter] = current ? current + 1 : 1
    }
  }

  return map
}

module.exports = charMap
