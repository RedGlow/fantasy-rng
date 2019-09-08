# fantasy-rng
A functional (pseudo) random number generator implementing Fantasy Land interfaces.

## Generator and factories

The library offers three factories to produce PRNG (pseuro random number generators).

### RNG interface

Random number generators (`RNG a`) are objects with two method properties:
- `next :: RNG a ~> () -> [a, RNG a]`: given a RNG, it returns a tuple with the next pseudo random number, and a new generator for the rest of the entries; this is the method mostly used in order to create a sequence of random numbers.
- `split :: RNG a ~> () => [RNG a, RNG a]`: given a RNG, it returns two indipendent RNGs; this method is useful when multiple recursions are needed.

#### Examples

A function to produce N random numbers from a single one:

```javascript
/**
 * @param {number} n - the length of the resulting list
 * @param {RNG} rng - a random number generator
 */
const randomlist = rng => n => {
  if (n === 0) {
    return [];
  }
  const [value, newRng] = rng.next();
  return [value].concat(randomlist(newRng)(n - 1));
};
```

A function to produce a binary tree of depth N:

```javascript
const createTree = rng => height => {
  if(height === 0) {
    return {
      type: 'leaf'
    };
  } else {
    const [value, newRng] = rng.next();
    const [rng1, rng2] = newRng.split();
    return {
      type: 'node',
      value,
      left: createTree(rng1)(height - 1),
      right: createTree(rng2)(height - 1),
    };
  }
};
```

### RNG Factories

There are some methods used to create standard RNGs.

- `defaultRandomGenerator :: RNG number` - not a factory per se, but just the instance of the default, global random number generator, initialized at startup with a random seed.
- `createRandomGenerator :: number -> RNG number` - a factory to create a pseudo random number generator starting from a seed; the implementation is based on tf-random.
- `createStaticGenerator :: number[] -> RNG number` - a factory to create a generator that just repeats the values given in cycle; the split method creates two static generators, one with the even indices, the other with the odd indices. 

## Random monad

Sometimes it's useful to manipulate random numbers through monadic constructs. `Random` is the implementation of the Random monad based upon a RNG. It follows the specifications of Fantasy Land.

A Random instance is created with:

- `fantasy-land/map`: maps every value produced by the generator using the given function.
- `fantasy-land/of`: creates a generator that produces the value provided over and over.
- `fantasy-land/ap`: creates a generator that couples the values produces by the generator and the functions produced by the argument, and applies them one to the other to create the monad from resulting generator.
- `fantasy-land/chain`: gets the first value of the main generator, applies the function and just returns a monad from the resulting generator.