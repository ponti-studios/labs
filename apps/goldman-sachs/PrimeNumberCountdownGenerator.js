
function isPrime (n) {
  for (var i = n - 1; i > 1; i--) {
    if (n % i === 0) return false
  }
  return true
}

function * countdownGenerator (n) {
  for (var i = n - 1; i > 1; i--) {
    if (isPrime(i)) yield i
  }
}

function testPassed () {
  let testPassed
  let n = 10
  const referenceResults = [7, 5, 3, 2]
  let i = 0
  const gen = countdownGenerator(n)

  while (i < referenceResults.length && testPassed !== false) {
    testPassed = gen.next().value === referenceResults[i]
    i++
  }

  return testPassed
}

if (testPassed()) {
  console.log('All tests passed!')
} else {
  console.log('Tests failed!')
}
