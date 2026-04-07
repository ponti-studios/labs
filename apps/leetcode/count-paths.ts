// -----------------
// Space Complexity (aka) memory usage
// -----------------
// There are only O(N) things that can be on call stack
// at any one time

import { strictEqual } from 'assert';

type Grid = [string, string][]

/**
 *
 * @param grid Grid
 * @param row Row of square
 * @param column Column of square
 */
function validSquare(grid: Grid, row: number, column: number) {

}

function isAtEnd(g, r, c) {

}

let countPathsCount = 0;
function countPaths(grid, row, col) {
  countPathsCount += 1;

  if (!validSquare(grid, row, col)) return 0;

  if (!isAtEnd(grid, row, col)) return 1;

  return (
    countPaths(grid, row + 1, col)
    + countPaths(grid, row, col + 1)
  );
}

let countPathsCountWithMemo = 0;
function countPathsWithMemo(grid, row, col, paths?: object) {
  countPathsCountWithMemo += 1;

  if (!validSquare(grid, row, col)) return 0;

  if (!isAtEnd(grid, row, col)) return 1;

  if (paths[row][col] === 0) {
    paths[row][col] = (
      countPathsWithMemo(grid, row + 1, col)
      + countPathsWithMemo(grid, row, col + 1)
    );
  }

  return paths[row][col];
}

const paths = {};
strictEqual(countPathsWithMemo([], 0, 0, paths));
strictEqual(countPathsCount, 5);
strictEqual(countPathsCountWithMemo, 5);
