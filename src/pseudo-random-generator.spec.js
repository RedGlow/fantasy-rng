import { describe } from "riteway";
import {
  createRandomGenerator,
  createStaticGenerator
} from "./pseudo-random-generator";
import { callN } from "./spechelpers";

const [call3, call9, call11] = [3, 9, 11].map(callN);

describe("pseudo-random-generator", async assert => {
  {
    const seed1 = 94935873482;
    const gen1 = createRandomGenerator(seed1);
    const values1 = call9(gen1);
    const gen2 = createRandomGenerator(seed1);
    const values2 = call9(gen2);
    assert({
      given: "two pseudo random number generators from the same seed",
      should: "produce the same set of values",
      actual: values2,
      expected: values1
    });

    const [gen11, gen12] = gen1.split();
    const [gen21, gen22] = gen2.split();
    const [values11, values12, values21, values22] = [
      gen11,
      gen12,
      gen21,
      gen22
    ].map(g => call9(g));
    assert({
      given: "a split of two rng from the same seed",
      should: "produce the same 'first' sub-generator",
      actual: values21,
      expected: values11
    });
    assert({
      given: "a split of two rng from the same seed",
      should: "produce the same 'second' sub-generator",
      actual: values22,
      expected: values12
    });
  }

  {
    const gen1 = createStaticGenerator([4, 2, 3, 5, 7]);
    const values = call11(gen1);
    assert({
      given: "a static number generator",
      should: "produce always the same sequence of values",
      actual: values,
      expected: [4, 2, 3, 5, 7, 4, 2, 3, 5, 7, 4]
    });

    const gens = gen1.split();
    const [values1, values2] = gens.map(gen => call3(gen));
    values1.forEach((value, i) =>
      assert({
        given: "a splitted static number generator",
        should: "produce distinct values",
        actual: value != values2[i],
        expected: true
      })
    );
  }
});
