import { describe } from "riteway";
import * as fl from "fantasy-land";

import { Random } from "./random";
import { createStaticGenerator } from "./pseudo-random-generator";
import { callN } from "./spechelpers";

const call7 = callN(7);

/**
 *
 * Produces an object which summarizes some values of Random, in order to make a comparison.
 * @param {Random} r the random object to summarize
 * @returns A summary of given Random
 */
const rngSummary = r => {
  const [rng1, rng2] = r.rng.split();
  return {
    firstSevenValues: call7(r.rng),
    firstSevenValuesSplit1: call7(rng1),
    firstSevenValuesSplit2: call7(rng2)
  };
};

/**
 * Creates an assert function from a given assert function, specializing it into comparing Random objects.
 * @param {import("riteway").assert} assert An assert object
 * @returns {import("riteway").assert} An assert object specialized in comparing Random objects
 */
const wrapAssert = assert => ({ given, should, expected, actual }) =>
  assert({
    given,
    should,
    expected: rngSummary(expected),
    actual: rngSummary(actual)
  });

describe("Random", async a => {
  const assert = wrapAssert(a);

  {
    ///
    /// FUNCTOR
    ///
    const r = Random(createStaticGenerator([3, 4, 5]));

    // expected behaviour
    const r2 = Random(createStaticGenerator([6, 8, 10]));
    assert({
      given: "a Random functor",
      should: "be able to map a function over each element returned",
      expected: r2,
      actual: r[fl.map](x => x * 2)
    });

    // check laws
    assert({
      given: "a Random functor",
      should: "respect the first law u.map(a => a) === u",
      expected: r,
      actual: r[fl.map](x => x)
    });

    const g = x => x * 2;
    const f = x => x + 3;

    assert({
      given: "a Random functor",
      should: "respect the second law u.map(x => f(g(x))) === u.map(g).map(f)",
      expected: r[fl.map](g)[fl.map](f),
      actual: r[fl.map](g)[fl.map](f)
    });
  }

  {
    ///
    /// APPLY
    ///
    const r = Random(createStaticGenerator([3, 4, 5]));

    // expected behaviour
    const r2 = Random(
      createStaticGenerator([x => x + 2, x => x + 6, x => x + 4])
    );
    assert({
      given: "a random Functor",
      should: "be able to apply random functions over each element",
      expected: Random(createStaticGenerator([5, 10, 9])),
      actual: r[fl.ap](r2)
    });

    // check laws
    const v = r; // [3,4,5]
    const u = Random(
      createStaticGenerator([x => x + 2, x => x - 1, x => x + 5])
    ); // 5, 3, 10
    const w = Random(
      createStaticGenerator([x => x * 2, x => x * 3, x => x / 2])
    ); // 10, 9, 5
    assert({
      given: "a Random apply",
      should:
        "respect the first law v.ap(u.ap(a.map(f => g => x => f(g(x))))) === v.ap(u).ap(a)",
      expected: v[fl.ap](u)[fl.ap](w),
      actual: v[fl.ap](u[fl.ap](w[fl.map](f => g => x => f(g(x)))))
    });
  }

  {
    ///
    /// APPLICATIVE
    ///
    const o = Random[fl.of](3);

    // expected behaviour
    a({
      given: "a unit",
      should: "contain only the given value",
      expected: [3, 3, 3, 3, 3, 3, 3],
      actual: call7(o.rng)
    });

    // check laws
    const r = Random(createStaticGenerator([3, 4, 5]));

    assert({
      given: "a Random applicative",
      should: "respect the first law v.ap(Random.of(x => x)) === v",
      expected: r,
      actual: r[fl.ap](Random[fl.of](x => x))
    });

    const f = x => x * 2;
    const x = 3;
    assert({
      given: "a Random applicative",
      should:
        "respect the second law Random.of(x).ap(Random.of(f)) === Random.of(f(x))",
      expected: Random[fl.of](f(x)),
      actual: Random[fl.of](x)[fl.ap](Random[fl.of](f))
    });

    const u = Random(
      createStaticGenerator([x => x * 2, x => x - 3, x => x / 2])
    );
    const y = 10;
    assert({
      given: "a Random applicative",
      should:
        "respect the third law Random.of(y).ap(u) === u.ap(Random.of(f => f(y)))",
      expected: u[fl.ap](Random[fl.of](f => f(y))),
      actual: Random[fl.of](y)[fl.ap](u)
    });
  }

  {
    ///
    /// CHAIN
    ///

    // expected behaviour
    const r = Random(createStaticGenerator([3]));
    const fr = x => Random(createStaticGenerator([x, x + 1, x + 2]));

    const e = Random(createStaticGenerator([3, 4, 5]));
    const a = r[fl.chain](fr);
    assert({
      given: "a Random chain",
      should: "correctly produce chains",
      expected: e,
      actual: a
    });

    // check laws
    const m = Random(createStaticGenerator([3, 7, 4]));
    const f = x => Random(createStaticGenerator([x + 3, x + 4, x + 5]));
    const g = x => Random(createStaticGenerator([x * 2, x / 2, x * 3]));
    assert({
      given: "a Random chain",
      should:
        "respect the first law: m.chain(f).chain(g) === m.chain(x => f(x).chain(g))",
      expected: m[fl.chain](f)[fl.chain](g),
      actual: m[fl.chain](x => f(x)[fl.chain](g))
    });
  }
});
