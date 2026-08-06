import assert from "node:assert/strict";
import test from "node:test";

import { calculateDemoScale } from "../src/lib/demoScale.js";

test("a smaller 16:10 viewport scales the complete demo proportionally", () => {
  assert.deepEqual(
    calculateDemoScale({
      viewportWidth: 1536,
      viewportHeight: 960,
      canvasWidth: 1920,
      canvasHeight: 1200,
    }),
    { scale: 0.8, renderedWidth: 1536, renderedHeight: 960 },
  );
});

test("a mismatched viewport uses contain sizing without cropping", () => {
  assert.deepEqual(
    calculateDemoScale({
      viewportWidth: 1000,
      viewportHeight: 800,
      canvasWidth: 1920,
      canvasHeight: 1200,
    }),
    { scale: 1000 / 1920, renderedWidth: 1000, renderedHeight: 625 },
  );
});

test("a larger matching viewport scales the complete demo up to fill it", () => {
  assert.deepEqual(
    calculateDemoScale({
      viewportWidth: 2560,
      viewportHeight: 1480,
      canvasWidth: 1707,
      canvasHeight: 987,
    }),
    {
      scale: 1480 / 987,
      renderedWidth: 2559.635,
      renderedHeight: 1480,
    },
  );
});

test("invalid measurements fall back without producing NaN styles", () => {
  assert.deepEqual(
    calculateDemoScale({
      viewportWidth: 0,
      viewportHeight: 0,
      canvasWidth: 1920,
      canvasHeight: 1200,
    }),
    { scale: 1, renderedWidth: 1920, renderedHeight: 1200 },
  );
});
