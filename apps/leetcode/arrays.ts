function findMaxConsecutiveOnes(nums: number[]): number {
  let count = 0;
  let currentCount = 0;

  for (let i = 0; i < nums.length; i += 1) {
    //
    if (nums[i] === 1) currentCount += 1;
    else if (i !== nums.length - 1) currentCount = 0;
    if (currentCount > count) count = currentCount;
  }

  return count;
}

console.log(findMaxConsecutiveOnes([1, 1, 1, 1, 0, 1, 1, 1, 0, 1])); // 4
console.log(findMaxConsecutiveOnes([1, 1, 0, 1, 1, 1, 0, 1])); // 3
