import assert from "node:assert/strict";
import { test } from "node:test";

test("crown burst spawns eight flowers only inside the bouquet crown", async () => {
  const { createCrownBurst } = await import("../src/lib/flowerPhysics.js");
  const burst = createCrownBurst({
    flowerRect: { left: 100, top: 200, width: 400, height: 500 },
    count: 8,
    seed: 42,
  });
  assert.equal(burst.length, 8);
  burst.forEach(({ x, y, velocity, radius }) => {
    assert.ok(x >= 180 && x <= 420);
    assert.ok(y >= 290 && y <= 440);
    assert.ok(velocity.y < 0);
    assert.ok(radius >= 14 && radius <= 23);
  });
});

test("bouquet crown region excludes the wrapping paper", async () => {
  const { getCrownRegion } = await import("../src/lib/flowerPhysics.js");
  assert.deepEqual(
    getCrownRegion({ left: 100, top: 200, width: 400, height: 500 }),
    { left: 180, top: 290, width: 240, height: 150 },
  );
});

test("marquee floor resolves to its top edge inside the physics container", async () => {
  const { getRelativeFloorY } = await import("../src/lib/flowerPhysics.js");
  assert.equal(
    getRelativeFloorY(
      { top: 6, height: 947 },
      { top: 853 },
    ),
    847,
  );
  assert.equal(getRelativeFloorY({ top: 6, height: 947 }, null), 947);
});

test("flower collision radius contains every rotated image corner", async () => {
  const { getFlowerCollisionRadius } = await import("../src/lib/flowerPhysics.js");
  assert.equal(getFlowerCollisionRadius(20), Math.SQRT2 * 20);
});

test("settled flowers expire ten seconds after their latest stable moment", async () => {
  const { getFlowerLifecycle } = await import("../src/lib/flowerPhysics.js");
  assert.equal(getFlowerLifecycle({ settledAt: 1000 }, 10999, 10000, 800), "settled");
  assert.equal(getFlowerLifecycle({ settledAt: 1000 }, 11000, 10000, 800), "fading");
  assert.equal(getFlowerLifecycle({ settledAt: 1000 }, 11800, 10000, 800), "expired");
  assert.equal(getFlowerLifecycle({ settledAt: null }, 20000, 10000, 800), "moving");
});

test("dragging a landed flower preserves its original disappearance clock", async () => {
  const { updateFlowerRestState } = await import("../src/lib/flowerPhysics.js");
  const record = { settledAt: 1000, stableSince: 900 };

  updateFlowerRestState(record, { speed: 0, angularSpeed: 0, dragging: true }, 5000);

  assert.equal(record.settledAt, 1000);
  assert.equal(record.stableSince, null);
});

test("releasing a sleeping dragged flower wakes it so gravity resumes", async () => {
  const Matter = (await import("matter-js")).default;
  const { releaseDraggedFlowerBody } = await import("../src/lib/flowerMatter.js");
  const body = Matter.Bodies.circle(100, 100, 20);
  Matter.Sleeping.set(body, true);
  Matter.Body.setStatic(body, true);

  releaseDraggedFlowerBody(body);

  assert.equal(body.isStatic, false);
  assert.equal(body.isSleeping, false);
  assert.ok(body.velocity.y > 0);
});

test("settled detection respects realistic low linear and angular speed", async () => {
  const { isFlowerSettled } = await import("../src/lib/flowerPhysics.js");
  assert.equal(isFlowerSettled({ speed: 0.08, angularSpeed: 0.012, dragging: false }), true);
  assert.equal(isFlowerSettled({ speed: 0.8, angularSpeed: 0.012, dragging: false }), false);
  assert.equal(isFlowerSettled({ speed: 0.08, angularSpeed: 0.4, dragging: false }), false);
  assert.equal(isFlowerSettled({ speed: 0, angularSpeed: 0, dragging: true }), false);
});

test("bee assignments are stable and capped at ten nearest settled flowers", async () => {
  const { assignBeesToFlowers } = await import("../src/lib/flowerPhysics.js");
  const bees = Array.from({ length: 10 }, (_, id) => ({ id, x: id * 10, y: 0 }));
  const flowers = Array.from({ length: 14 }, (_, id) => ({ id, x: id * 10, y: 100, settled: true }));
  const assignments = assignBeesToFlowers(bees, flowers, new Map(), 10);
  assert.equal(assignments.size, 10);
  assert.equal(new Set(assignments.values()).size, 10);
});

test("a dragged assigned flower keeps its bee until the flower fades", async () => {
  const { assignBeesToFlowers } = await import("../src/lib/flowerPhysics.js");
  const previous = new Map([[0, "flower-a"]]);
  const result = assignBeesToFlowers(
    [{ id: 0, x: 0, y: 0 }],
    [{ id: "flower-a", x: 300, y: 400, settled: false, dragging: true, fading: false }],
    previous,
    10,
  );
  assert.equal(result.get(0), "flower-a");
});

test("a newly dragged flower gets a bee even when every bee already has a settled target", async () => {
  const { assignBeesToFlowers } = await import("../src/lib/flowerPhysics.js");
  const bees = Array.from({ length: 10 }, (_, id) => ({ id, x: id * 10, y: 0 }));
  const settledFlowers = Array.from({ length: 10 }, (_, id) => ({
    id: `settled-${id}`,
    x: id * 10,
    y: 100,
    settled: true,
    dragging: false,
    fading: false,
  }));
  const previous = new Map(bees.map((bee) => [bee.id, `settled-${bee.id}`]));
  const draggedFlower = {
    id: "dragged",
    x: 45,
    y: 40,
    settled: false,
    dragging: true,
    fading: false,
  };

  const result = assignBeesToFlowers(bees, [...settledFlowers, draggedFlower], previous, 10);

  assert.equal(result.size, 10);
  assert.equal([...result.values()].includes("dragged"), true);
});

test("a fading flower releases its bee to the normal swarm", async () => {
  const { assignBeesToFlowers } = await import("../src/lib/flowerPhysics.js");
  const result = assignBeesToFlowers(
    [{ id: 0, x: 0, y: 0 }],
    [{ id: "flower-a", x: 20, y: 30, settled: true, fading: true }],
    new Map([[0, "flower-a"]]),
    10,
  );
  assert.equal(result.has(0), false);
});
