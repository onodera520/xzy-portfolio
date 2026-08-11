import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createSparkBurst,
  getSparkSegment,
  shouldCreateSpark,
} from "../src/lib/clickSpark.js";

test("creates eight evenly spaced sparks from the pointer coordinate", () => {
  const sparks = createSparkBurst({ x: 120, y: 80, count: 8, startTime: 40 });

  assert.equal(sparks.length, 8);
  assert.deepEqual(sparks[0], { x: 120, y: 80, angle: 0, startTime: 40 });
  assert.equal(sparks[1].angle, Math.PI / 4);
  assert.equal(sparks[7].angle, (Math.PI * 7) / 4);
});

test("moves and fades a spark with ease-out until its 320ms lifetime ends", () => {
  const spark = { x: 100, y: 50, angle: 0, startTime: 20 };
  const config = {
    duration: 320,
    sparkRadius: 18,
    sparkSize: 10,
    easing: "ease-out",
  };

  assert.deepEqual(getSparkSegment(spark, 20, config), {
    x1: 100,
    y1: 50,
    x2: 110,
    y2: 50,
    alpha: 1,
  });

  const midpoint = getSparkSegment(spark, 180, config);
  assert.equal(midpoint.x1, 113.5);
  assert.equal(midpoint.x2, 116);
  assert.equal(midpoint.alpha, 0.5);
  assert.equal(getSparkSegment(spark, 340, config), null);
});

test("only eligible primary pointer events create sparks", () => {
  const allowed = {
    button: 0,
    isPrimary: true,
    reducedMotion: false,
    blockedTarget: false,
    documentHidden: false,
  };

  assert.equal(shouldCreateSpark(allowed), true);
  assert.equal(shouldCreateSpark({ ...allowed, button: 2 }), false);
  assert.equal(shouldCreateSpark({ ...allowed, isPrimary: false }), false);
  assert.equal(shouldCreateSpark({ ...allowed, reducedMotion: true }), false);
  assert.equal(shouldCreateSpark({ ...allowed, blockedTarget: true }), false);
  assert.equal(shouldCreateSpark({ ...allowed, documentHidden: true }), false);
});
