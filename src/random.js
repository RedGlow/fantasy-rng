import * as fl from "fantasy-land";
import { tagged } from "daggy";

import { createStaticGenerator } from "./pseudo-random-generator";

const Random = tagged("Random", ["rng"]);

Random[fl.of] = value => Random(createStaticGenerator([value]));

const split = t => func => arg =>
  t.rng.split().map(rng => Random(rng)[func](arg).rng);

const zip = arr1 => arr2 => arr1.map((v1, i) => [v1, arr2[i]]);

// fantasy-land/map :: Functor f => f a ~> (a -> b) -> f b
Random.prototype[fl.map] = function(f) {
  return Random({
    next: () => {
      const [value, nextRng] = this.rng.next();
      return [f(value), Random(nextRng)[fl.map](f).rng];
    },
    split: () => split(this)(fl.map)(f)
  });
};

// fantasy-land/ap :: Apply f => f a ~> f (a -> b) -> f b
Random.prototype[fl.ap] = function(randomf) {
  return Random({
    next: () => {
      const [value, nextRng] = this.rng.next();
      const [f, nextRngf] = randomf.rng.next();
      return [f(value), Random(nextRng)[fl.ap](Random(nextRngf)).rng];
    },
    split: () =>
      zip(this.rng.split())(randomf.rng.split()).map(
        ([rng, rngf]) => Random(rng)[fl.ap](Random(rngf)).rng
      )
  });
};

// fantasy-land/chain :: Chain m => m a ~> (a -> m b) -> m b
Random.prototype[fl.chain] = function(randomf) {
  return randomf(this.rng.next()[0]);
};

export default Random;
