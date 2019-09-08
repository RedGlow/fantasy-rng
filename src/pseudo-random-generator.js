// @ts-check
import { TFGen } from "@susisu/tf-random";

import splitNumber from "./split-number";

/**
 * @callback NextFunction
 * @returns [number, SplittableRandomNumberGenerator]
 */

/**
 * @callback SplitFunction
 * @returns [SplittableRandomNumberGenerator, SplittableRandomNumberGenerator]
 */

/**
 * A splittable random number generator.
 * @typedef {Object} SplittableRandomNumberGenerator
 * @property {() => [number, SplittableRandomNumberGenerator]} next - gets a random number and the next generator.
 * @property {() => [SplittableRandomNumberGenerator, SplittableRandomNumberGenerator]} split - splits the random number generator in two parts.
 */

/**
 * Create a new (pseudo) random number generator from a seed. The implementation
 * is based on tf-random.
 * @param {number} seed The seed of the random number generator
 * @returns {SplittableRandomNumberGenerator} A random number generator.
 */
export const createRandomGenerator = seed => {
  const [a0, a1, b0, b1, c0, c1, d0, d1] = splitNumber(8)(seed);
  return TFGen.seed(a0, a1, b0, b1, c0, c1, d0, d1);
};

export const defaultRandomGenerator = createRandomGenerator(
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
);

/**
 * Create a new random number generator that always returns the same set of values, cyclically.
 * @param {number[]} values All the values returned by this generator
 * @returns {SplittableRandomNumberGenerator} A static number generator.
 */
export const createStaticGenerator = values => {
  /**
   * @param {number} x
   */
  const crop = x => x % values.length;
  /**
   * @param {number} i
   * @param {number} delta
   */
  const createGenerator = (i, delta) => ({
    next: /** @type NextFunction */ () => [
      values[i],
      createGenerator(crop(i + delta), delta)
    ],
    split: /** @type SplitFunction */ () => [
      createGenerator(i, delta * 2),
      createGenerator(crop(i + delta), delta * 2)
    ]
  });
  return createGenerator(0, 1);
};
