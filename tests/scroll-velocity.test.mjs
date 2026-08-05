import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveScrollDirection,
  scrollDisplacement,
  wrapOffset,
} from "../src/lib/scrollVelocity.js";

test("two marquee rows move oppositely and reverse with scroll direction", () => {
  assert.equal(
    scrollDisplacement({
      scrollVelocity: 600,
      deltaMs: 16,
      velocity: 40,
      rowIndex: 0,
      direction: 1,
    }),
    -1.024,
  );
  assert.equal(
    scrollDisplacement({
      scrollVelocity: 600,
      deltaMs: 16,
      velocity: 40,
      rowIndex: 1,
      direction: 1,
    }),
    1.024,
  );
  assert.equal(
    scrollDisplacement({
      scrollVelocity: -600,
      deltaMs: 16,
      velocity: 40,
      rowIndex: 0,
      direction: -1,
    }),
    1.024,
  );
  assert.equal(
    scrollDisplacement({
      scrollVelocity: -600,
      deltaMs: 16,
      velocity: 40,
      rowIndex: 1,
      direction: -1,
    }),
    -1.024,
  );
});

test("marquee keeps moving slowly after scrolling stops and wraps without a seam", () => {
  assert.equal(
    scrollDisplacement({
      scrollVelocity: 0,
      deltaMs: 16,
      velocity: 40,
      rowIndex: 0,
      direction: 1,
    }),
    -0.64,
  );
  assert.equal(resolveScrollDirection(500, -1), 1);
  assert.equal(resolveScrollDirection(-500, 1), -1);
  assert.equal(resolveScrollDirection(0, -1), -1);
  assert.equal(wrapOffset(-300, 0, -301), -1);
});
