import assert from "node:assert/strict";
import test from "node:test";

import { getPillLayoutSize } from "../src/lib/pillGeometry.js";

test("pill geometry ignores a transformed visual bounding box", () => {
  const element = {
    offsetWidth: 76,
    offsetHeight: 37,
    getBoundingClientRect: () => ({ width: 65.36, height: 37 }),
  };

  assert.deepEqual(getPillLayoutSize(element), { width: 76, height: 37 });
});
