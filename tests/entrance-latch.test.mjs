import assert from "node:assert/strict";
import test from "node:test";

import { createEntranceLatch } from "../src/lib/entranceLatch.js";

test("entrance latch permits only the first enabled animation in a component lifetime", () => {
  const latch = createEntranceLatch();

  assert.equal(latch.shouldAnimate(true, false), true);
  latch.complete();
  assert.equal(latch.shouldAnimate(true, false), false);
  assert.equal(latch.shouldAnimate(true, false), false);
});

test("an interrupted StrictMode setup can retry before the entrance completes", () => {
  const latch = createEntranceLatch();

  assert.equal(latch.shouldAnimate(true, false), true);
  latch.cancel();
  assert.equal(latch.shouldAnimate(true, false), true);
  latch.complete();
  assert.equal(latch.shouldAnimate(true, false), false);
});

test("disabled or reduced-motion first mount consumes the entrance without replaying later", () => {
  const disabledLatch = createEntranceLatch();
  const reducedMotionLatch = createEntranceLatch();

  assert.equal(disabledLatch.shouldAnimate(false, false), false);
  assert.equal(disabledLatch.shouldAnimate(true, false), false);
  assert.equal(reducedMotionLatch.shouldAnimate(true, true), false);
  assert.equal(reducedMotionLatch.shouldAnimate(true, false), false);
});

test("a new component lifetime receives a fresh entrance", () => {
  const firstMount = createEntranceLatch();
  const secondMount = createEntranceLatch();

  assert.equal(firstMount.shouldAnimate(true, false), true);
  firstMount.complete();
  assert.equal(firstMount.shouldAnimate(true, false), false);
  assert.equal(secondMount.shouldAnimate(true, false), true);
});
