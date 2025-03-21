// Given an array of strings, group anagrams together.

// Example:

// Input: ["eat", "tea", "tan", "ate", "nat", "bat"],
// Output:
// [
//   ["ate","eat","tea"],
//   ["nat","tan"],
//   ["bat"]
// ]
// Note:
// All inputs will be in lowercase.
// The order of your output does not matter.

function checkAllLetters(arr: string[], word: string): boolean {
  const firstWord = arr[0];

  return (
    // Check that words are the same length.
    // If this is false, no need to proceed with further computations.
    firstWord.length === word.length
    && word
      .split('')
      .reduce((array, letter) => {
        array.push(firstWord.indexOf(letter) !== -1);
        return array;
      }, [])
      .indexOf(false) === -1
  );
}

function getAnagramArrayIndex(results: string[][], word: string): number {
  for (let i = 0; i < results.length; i += 1) {
    console.log(results);
    if (checkAllLetters(results[i], word)) return i;
  }

  return -1;
}

function anagramer(initial: string[]) {
  const results = [];

  initial.forEach((word) => {
    const index = getAnagramArrayIndex(results, word); // results, 'eat'

    if (index >= 0) {
      results[index].push(word);
    } else {
      results.push([word]);
    }
  });

  return results;
}

const input = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
console.log(anagramer(input));
console.log(anagramer([...input, 'abt']));
// console.log(checkAllLetters(['eat'], 'tea'))
// console.log(checkAllLetters(['eat'], 'abaneat'))
// console.log(checkAnagramArray([['eat'], ['ban']], 'tea')) // 0
// console.log(checkAnagramArray([['eat'], ['ban'], ['zap']], 'nab')) // 1
