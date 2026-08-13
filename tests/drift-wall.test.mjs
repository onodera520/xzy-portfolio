import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDriftWallColumns,
  resolveDriftWallActiveId,
  resolveDriftWallActiveColumn,
  resolveDriftWallCopyCount,
  resolveDriftWallTileSize,
  resolveDriftWallTransform,
  shouldAdvanceDriftColumn,
} from "../src/lib/driftWall.js";

test("DriftWall resolves the tile currently passing beneath a stationary pointer", () => {
  const tile = { dataset: { driftTile: "3-1-2" } };
  assert.equal(resolveDriftWallActiveId({ closest: () => tile }), "3-1-2");
  assert.equal(resolveDriftWallActiveId({ closest: () => null }), null);
  assert.equal(resolveDriftWallActiveId(null), null);
});

test("DriftWall builds exactly five fixed-size project columns", () => {
  const images = Array.from({ length: 8 }, (_, index) => ({ src: `image-${index}` }));
  const columns = buildDriftWallColumns(images, 5, 4);

  assert.equal(columns.length, 5);
  assert.deepEqual(columns.map((column) => column.length), [4, 4, 4, 4, 4]);
  assert.deepEqual(columns.map((column) => column[0].src), [
    "image-0",
    "image-3",
    "image-6",
    "image-1",
    "image-4",
  ]);
});

test("DriftWall pauses only the hovered column and resumes after pointer leave", () => {
  assert.equal(resolveDriftWallActiveColumn("3-1-2"), 3);
  assert.equal(resolveDriftWallActiveColumn(null), null);
  assert.equal(shouldAdvanceDriftColumn(3, 3, true), false);
  assert.equal(shouldAdvanceDriftColumn(3, 2, true), true);
  assert.equal(shouldAdvanceDriftColumn(null, 3, true), true);
});

test("desktop DriftWall tiles are enlarged ten percent without changing their ratio", () => {
  const standard = resolveDriftWallTileSize(1440);
  const fullscreen = resolveDriftWallTileSize(2048);
  const ultrawide = resolveDriftWallTileSize(2560);

  assert.deepEqual(standard, { width: 264, height: 169.4 });
  assert.deepEqual(fullscreen, { width: 264, height: 169.4 });
  assert.deepEqual(ultrawide, { width: 264, height: 169.4 });
});

test("DriftWall keeps enough sequence copies to cover the perspective viewport at wrap boundaries", () => {
  assert.equal(resolveDriftWallCopyCount({ containerHeight: 724, sequenceHeight: 656 }), 3);
  assert.equal(resolveDriftWallCopyCount({ containerHeight: 620, sequenceHeight: 656 }), 3);
  assert.equal(resolveDriftWallCopyCount({ containerHeight: 1600, sequenceHeight: 500 }), 7);
});

test("DriftWall uses zero tilt turn and roll while retaining depth", () => {
  assert.equal(
    resolveDriftWallTransform({ pointerX: 0, pointerY: 0, tilt: 0, turn: 0, roll: 0 }),
    "translate3d(-50%, -50%, -130px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
  );
  assert.equal(
    resolveDriftWallTransform({ pointerX: 1, pointerY: -1, tilt: 0, turn: 0, roll: 0, parallax: 1 }),
    "translate3d(-50%, -50%, -130px) rotateX(-8deg) rotateY(8deg) rotateZ(0deg)",
  );
});
