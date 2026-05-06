/**
 * Two Sum Problem
 *
 * Given an array of integers nums and an integer target, return the indices of the two numbers
 * such that they add up to target. You may assume that each input has exactly one solution,
 * and you may not use the same element twice.
 */

export function twoSum(nums: number[], target: number): number[] | string {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];

    if (map.get(diff) !== undefined) return [map.get(diff), i];

    map.set(nums[i], i);
  }

  return "No two sum solution";
}

// Example usage
export const twoSumExample = () => {
  const nums = [2, 7, 11, 15];
  const target = 9;
  const result = twoSum(nums, target);
  return { nums, target, result };
};
