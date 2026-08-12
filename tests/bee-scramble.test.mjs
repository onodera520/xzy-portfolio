import assert from "node:assert/strict";
import { test } from "node:test";

test("bee scramble selects two to four nearest glyphs inside the pointer radius", async () => {
  const { selectBeeScrambleTargets } = await import("../src/lib/beeScramble.js");
  const glyphs = [
    { index: 0, distance: 160 },
    { index: 1, distance: 18 },
    { index: 2, distance: 42 },
    { index: 3, distance: 64 },
    { index: 4, distance: 90 },
    { index: 5, distance: 119 },
  ];

  assert.deepEqual(
    selectBeeScrambleTargets(glyphs, { radius: 120, minCount: 2, maxCount: 4, randomValue: 0 }),
    [1, 2],
  );
  assert.deepEqual(
    selectBeeScrambleTargets(glyphs, { radius: 120, minCount: 2, maxCount: 4, randomValue: 0.999 }),
    [1, 2, 3, 4],
  );
  assert.deepEqual(
    selectBeeScrambleTargets([{ index: 7, distance: 30 }], { radius: 120, minCount: 2, maxCount: 4 }),
    [7],
  );
});

test("scramble sprites interleave flowers and bees", async () => {
  const { getBeeScrambleSprite } = await import("../src/lib/beeScramble.js");

  assert.deepEqual(
    Array.from({ length: 6 }, (_, order) => getBeeScrambleSprite(order)),
    ["flower", "bee", "flower", "bee", "flower", "bee"],
  );
});

test("a title hover excludes glyphs that already scrambled in the same pass", async () => {
  const { selectBeeScrambleTargets } = await import("../src/lib/beeScramble.js");
  const glyphs = [
    { index: 0, distance: 12 },
    { index: 1, distance: 24 },
    { index: 2, distance: 36 },
    { index: 3, distance: 48 },
  ];

  assert.deepEqual(
    selectBeeScrambleTargets(glyphs, {
      radius: 120,
      minCount: 2,
      maxCount: 2,
      excludedIndices: new Set([0, 1]),
    }),
    [2, 3],
  );
});

test("a title hover loops locally while keeping at most three active glyphs", async () => {
  const { selectBeeScrambleTargets } = await import("../src/lib/beeScramble.js");
  const glyphs = Array.from({ length: 8 }, (_, index) => ({ index, distance: 10 + index }));
  const firstPass = selectBeeScrambleTargets(glyphs, {
    radius: 120,
    minCount: 3,
    maxCount: 3,
    activeLimit: 3,
  });

  assert.deepEqual(firstPass, [0, 1, 2]);
  assert.deepEqual(
    selectBeeScrambleTargets(glyphs, {
      radius: 120,
      minCount: 3,
      maxCount: 3,
      activeLimit: 3,
      excludedIndices: new Set(firstPass),
    }),
    [],
  );
  assert.deepEqual(
    selectBeeScrambleTargets(glyphs, {
      radius: 120,
      minCount: 3,
      maxCount: 3,
      activeLimit: 3,
      excludedIndices: new Set([1, 2]),
    }),
    [0],
  );
});
