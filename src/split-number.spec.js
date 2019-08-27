// @ts-check

import { describe } from "riteway";
import splitNumber from "./split-number";

describe("split-number", async assert => {
  /**
   * 100101110111001010011 = 1240659
   * 1  1  1  1  0  0  0   = 120
   *  0  0  1  1  0  1  1  = 27
   *   0  1  0  1  1  0  1 = 45
   */
  assert({
    given: "a number",
    should: "be able to split it in 3 parts bitwise",
    expected: [120, 27, 45].sort(),
    actual: splitNumber(3)(1240659).sort()
  });
});
