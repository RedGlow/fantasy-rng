// @ts-check

/**
 * A function taking a number and splitting it in a fixed number of parts.
 * @callback SplitNumber1
 * @param {number}    number  The number to split
 * @returns {number[]}        The list of splitted numbers
 */

/**
 * Splits a number in a certain amount of numbers, bitwise. E.g.:
 * ```
 * splitNumber(3)(
 *   100101110111001010011 = 1240659
 * ) = [
 *   1  1  1  1  0  0  0   = 120,
 *    0  0  1  1  0  1  1  = 27,
 *     0  1  0  1  1  0  1 = 45
 * ]
 * ```
 * @param {number} numSplits    The number of splits to create
 * @returns {SplitNumber1}      A function taking a number and splitting it in a fixed number of parts.
 */
const splitNumber = numSplits => number =>
  nums(new Array(numSplits).fill(0), number);

/**
 * @param {number[]} numbers
 * @param {number} seed
 */
const nums = (numbers, seed) => {
  let pow = 0;
  while (seed !== 0) {
    numbers = numbers.map((n, i) => n | (((seed & (1 << i)) >>> i) << pow));
    seed = seed >> numbers.length;
    pow++;
  }
  return numbers;
};

export default splitNumber;
