/**
 *
 * @param {import("./pseudo-random-generator").SplittableRandomNumberGenerator} rng
 */
export const callN = n => rng => {
  if (n === 0) {
    return [];
  }
  const [value, newRng] = rng.next();
  return [value].concat(callN(n - 1)(newRng));
};
