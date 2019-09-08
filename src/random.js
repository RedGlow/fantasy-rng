import * as fl from "fantasy-land";
import { tagged } from "daggy";

import { createStaticGenerator } from "./pseudo-random-generator";

const Random = tagged("Random", ["rng"]);

Random[fl.of] = value => Random(createStaticGenerator([value]));

// fantasy-land/map :: Functor f => f a ~> (a -> b) -> f b
Random.prototype[fl.map] = function(f) {
  return Random({
    next: () => {
      const [value, nextRng] = this.rng.next();
      return [f(value), Random(nextRng)[fl.map](f).rng];
    },
    split: () => {
      return this.rng.split().map(rng => Random(rng)[fl.map](f).rng);
    }
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
    split: () => {
      const [rng1, rng2] = this.rng.split();
      const [rngf1, rngf2] = randomf.rng.split();
      return [
        Random(rng1)[fl.ap](Random(rngf1)).rng,
        Random(rng2)[fl.ap](Random(rngf2)).rng
      ];
    }
  });
};

Random.prototype[fl.chain] = function(randomf) {
  return {
    next: () => {
      const [value] = this.rng.next();
      const randomb = randomf(value);
      return randomb;
    },
    split: () => {
      return this.rng.split().map(randomf);
    }
  };
};

export default Random;
