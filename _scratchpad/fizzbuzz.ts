/*
 * Assignment: Fizzbuzz
 * Description: Write a program that prints the numbers from 1 to 100. 
 * But for multiples of three print "Fizz" instead of the number and for the multiples of five print "Buzz". 
 * For numbers which are multiples of both three and five print "FizzBuzz".
 */

function fizzbuzzValue(value: number): string {
  return value % 15 === 0 ? 'FizzBuzz' :
    value % 3 === 0 ? 'Fizz' :
    value % 5 === 0 ? 'Buzz' : String(value)
}

function parseBenchmarkSize(): number {
  const defaultSize = 100
  const args = Bun.argv.slice(2)
  const flagIndex = args.indexOf('--size')

  if (flagIndex !== -1 && args[flagIndex + 1]) {
    const parsed = Number(args[flagIndex + 1])
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed)
  }

  const sizeFlag = args.find(arg => arg.startsWith('--size='))
  if (sizeFlag) {
    const parsed = Number(sizeFlag.split('=')[1])
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed)
  }

  return defaultSize
}

function benchmarkIterations(size: number): number {
  if (size <= 100) return 10000
  if (size <= 10_000) return 1000
  if (size <= 100_000) return 100
  return 10
}

export function fizzbuzzConcat(size = 100): string {
  let result = ''

  for (let i = 1; i <= size; i++) {
    result += `${fizzbuzzValue(i)}\n`
  }

  return result
}

export function fizzbuzzPushJoin(size = 100): string {
  const result: string[] = []

  for (let i = 1; i <= size; i++) {
    result.push(fizzbuzzValue(i))
  }

  return result.join('\n')
}

export function fizzbuzzArrayFromMap(size = 100): string {
  return Array.from({ length: size }, (_, index) => fizzbuzzValue(index + 1)).join('\n')
}

export function *fizzbuzzYield(size = 100): Generator<string> {
  for (let i = 1; i <= size; i++) {
    yield fizzbuzzValue(i)
  }
}

export function fizzbuzzYieldCollect(size = 100): string {
  return Array.from(fizzbuzzYield(size)).join('\n')
}

// Write your fizzbuzz function here
export function fizzbuzz(): string {
  return fizzbuzzArrayFromMap()
}

function normalizeFizzbuzzResult(result: string | Iterable<string>): string[] {
  return typeof result === 'string'
    ? result.trim().split('\n')
    : Array.from(result, String)
}

// Test function - do not modify
export function testFizzbuzz(): void {
  const lines = normalizeFizzbuzzResult(fizzbuzz())

  if (lines.length !== 100) {
    console.error(`Expected 100 lines, got ${lines.length}`)
    console.log(lines)
    return
  }

  let passed = 0
  for (let i = 1; i <= 100; i++) {
    const expected =
      i % 15 === 0 ? 'FizzBuzz' :
      i % 3 === 0 ? 'Fizz' :
      i % 5 === 0 ? 'Buzz' :
      String(i)

    if (lines[i - 1] === expected) {
      passed++
    } else {
      console.error(`Line ${i}: expected "${expected}", got "${lines[i - 1]}"`)
    }
  }

  console.log(`Passed ${passed}/100 tests`)
}

function benchmarkFizzbuzz(): void {
  const size = parseBenchmarkSize()
  const iterations = benchmarkIterations(size)

  const methods = [
    ['concat', fizzbuzzConcat],
    ['push + join', fizzbuzzPushJoin],
    ['Array.from + map + join', fizzbuzzArrayFromMap],
    ['yield + collect', fizzbuzzYieldCollect],
  ] as const

  console.log(`\nBenchmark results (${size} items, ${iterations} iterations):`)

  for (const [label, method] of methods) {
    const startedAt = performance.now()
    let totalLength = 0

    for (let i = 0; i < iterations; i++) {
      totalLength += method(size).length
    }

    const elapsed = performance.now() - startedAt
    console.log(`${label.padEnd(24)} ${elapsed.toFixed(2)}ms (${totalLength} chars total)`)
  }
}

// Run tests
testFizzbuzz()
benchmarkFizzbuzz()


