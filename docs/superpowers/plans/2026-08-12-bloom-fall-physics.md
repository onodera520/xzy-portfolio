# Bloom Fall Physics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 点击首页主花束时，从花冠区域喷出低弹性花朵；花朵落在横向跑马灯顶部、支持桌面拖动，稳定 10 秒后消散，并让现有蜜蜂在落地期间认领和跟随花朵。

**Architecture:** 使用 `matter-js` 只负责物理世界和碰撞计算，透明花朵继续使用普通 DOM 图片渲染。`BloomPhysicsExperience` 通过 Context 连接 Hero、物理层与跑马灯地面；高频位置存放在可变引用中，避免每帧 React 重渲染。`BeeSwarmHero` 每帧读取稳定花朵目标，已分配蜜蜂优先跟随花朵，未分配蜜蜂保留现有鼠标/绕花行为。

**Tech Stack:** React 19、Vite 8、Matter.js、GSAP、CSS、Node test runner

## Global Constraints

- 继续使用现有 React + Vite 项目和 `http://127.0.0.1:3000/`，不部署公网。
- 桌面每次喷发 8 朵，手机每次 5 朵，同时最多 30 朵。
- 发射点只位于主花束高度约 18%–48%、中央约 60% 宽度的花冠区域。
- 花朵以线性初速度向上和两侧扇形喷出，随后低弹性、偏重地下落，不产生明显弹跳。
- `.home-marquee` 顶部是唯一地面；花朵不得进入跑马灯内容。
- 桌面最多 10 只、手机最多 6 只现有蜜蜂认领稳定花朵；其他蜜蜂保持原逻辑。
- 花朵稳定满 10 秒后用约 0.8 秒缩小淡出；移动或拖动会重置稳定计时。
- 桌面允许鼠标拖动花朵，手机关闭拖动。
- `prefers-reduced-motion` 下不生成物理花朵，只保留花束短促按压反馈。
- 不修改作品案例内容、首页其余模块、已有蜜蜂鼠标追随边界或长图展示。

---

### Task 1: 花朵物理纯逻辑与 Matter.js 依赖

**Files:**
- Create: `src/lib/flowerPhysics.js`
- Create: `tests/flower-physics.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `normalizeFlowerConfig(config)`
- Produces: `createCrownBurst({ flowerRect, count, seed })`
- Produces: `isFlowerSettled(sample, thresholds)`
- Produces: `getFlowerLifecycle(state, now, settleDelay, fadeDuration)`
- Produces: `assignBeesToFlowers(bees, flowers, previousAssignments, limit)`

- [ ] **Step 1: Write failing tests for the physical contract**

```js
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
  burst.forEach(({ x, y, velocity }) => {
    assert.ok(x >= 180 && x <= 420);
    assert.ok(y >= 290 && y <= 440);
    assert.ok(velocity.y < 0);
  });
});

test("settled flowers expire ten seconds after their latest stable moment", async () => {
  const { getFlowerLifecycle } = await import("../src/lib/flowerPhysics.js");
  assert.equal(getFlowerLifecycle({ settledAt: 1000 }, 10999, 10000, 800), "settled");
  assert.equal(getFlowerLifecycle({ settledAt: 1000 }, 11000, 10000, 800), "fading");
  assert.equal(getFlowerLifecycle({ settledAt: 1000 }, 11800, 10000, 800), "expired");
});

test("bee assignments are stable and capped at ten nearest settled flowers", async () => {
  const { assignBeesToFlowers } = await import("../src/lib/flowerPhysics.js");
  const bees = Array.from({ length: 10 }, (_, id) => ({ id, x: id * 10, y: 0 }));
  const flowers = Array.from({ length: 14 }, (_, id) => ({ id, x: id * 10, y: 100, settled: true }));
  const assignments = assignBeesToFlowers(bees, flowers, new Map(), 10);
  assert.equal(assignments.size, 10);
  assert.equal(new Set(assignments.values()).size, 10);
});
```

- [ ] **Step 2: Run the tests and verify the module is missing**

Run: `node --test tests/flower-physics.test.mjs`

Expected: FAIL because `src/lib/flowerPhysics.js` does not exist.

- [ ] **Step 3: Install Matter.js**

Run: `npm.cmd install matter-js`

Expected: `matter-js` appears in dependencies and the lockfile updates without adding unrelated packages.

- [ ] **Step 4: Implement deterministic pure helpers**

Implement a small seeded PRNG; clamp counts to `1..30`; generate crown origins within horizontal `20%..80%` and vertical `18%..48%` of `flowerRect`; generate negative initial `velocity.y` and symmetric horizontal spread. Treat a flower as settled only when linear speed and angular speed remain below thresholds. Preserve valid previous bee assignments before filling remaining nearest pairs.

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/flower-physics.test.mjs`

Expected: all flower-physics tests PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/flowerPhysics.js tests/flower-physics.test.mjs
git commit -m "feat: add bloom physics primitives"
```

---

### Task 2: 共享物理容器与花朵落体层

**Files:**
- Create: `src/components/BloomPhysicsExperience.jsx`
- Create: `src/components/FlowerFallLayer.jsx`
- Create: `src/components/FlowerFallLayer.css`
- Modify: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: `createCrownBurst`, `isFlowerSettled`, `getFlowerLifecycle`
- Produces: `useBloomPhysics()` returning `{ spawnBurst, registerFloor, flowerTargetsRef, flowerCountRef }`
- Produces: `<BloomPhysicsExperience flowerSrc burstCount mobileBurstCount maxFlowers settleMs fadeMs>`
- Produces: `<FlowerFallLayer />` rendered internally by the provider

- [ ] **Step 1: Write failing SSR integration assertions**

```js
test("homepage exposes the transparent bloom physics layer", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  assert.match(html, /data-bloom-physics="true"/);
  assert.match(html, /data-burst-count="8"/);
  assert.match(html, /data-mobile-burst-count="5"/);
  assert.match(html, /data-max-flowers="30"/);
  assert.match(html, /data-settle-ms="10000"/);
});
```

- [ ] **Step 2: Run the targeted test and verify it fails**

Run: `npm.cmd test -- --test-name-pattern "transparent bloom physics layer"`

Expected: FAIL because the provider and data contract are absent.

- [ ] **Step 3: Implement the provider and mutable API**

Create one Context whose public methods are stable refs. `spawnBurst(originRegion)` queues burst descriptors; `registerFloor(element)` stores the `.home-marquee` element; `flowerTargetsRef.current` exposes `{ id, x, y, settled, dragging }[]` in viewport coordinates. Do not put per-frame coordinates in React state.

- [ ] **Step 4: Implement Matter.js bodies and DOM rendering**

Create `Engine` with sleeping enabled. Add left/right walls and a floor whose Y coordinate is recomputed from the registered marquee element. Spawn circular bodies sized to the transparent flower sprite, with `restitution: 0.03`, high surface friction and moderate `frictionAir`. Render each flower as a keyed `<img>` and update only its `style.transform`, opacity and scale per frame.

- [ ] **Step 5: Implement lifecycle and 30-flower cap**

Track stable duration outside React. Reset `settledAt` when speed rises, a collision wakes the body or dragging starts. After 10 seconds enter an 800ms fade, then remove both body and DOM record. When a new burst would exceed 30, fade the oldest settled, non-dragged records first; otherwise refuse excess new records rather than deleting active dragged flowers.

- [ ] **Step 6: Implement desktop Pointer Events drag**

Give only flower images `pointer-events: auto`. On `pointerdown`, use pointer capture and set the Matter body static while dragging. On move, set body position to the pointer; on release, restore dynamic state with near-zero release velocity. Skip handlers for coarse pointers and touch devices.

- [ ] **Step 7: Add responsive and reduced-motion CSS**

The layer must be fixed to the viewport, visually transparent and non-blocking. Flowers are `28–46px` desktop and `24–38px` mobile. Use `.is-dragging` and `.is-fading`; under reduced motion hide the flower layer and prevent spawning.

- [ ] **Step 8: Run focused tests and build**

Run: `npm.cmd test -- --test-name-pattern "transparent bloom physics layer"`

Run: `npm.cmd run build`

Expected: PASS; production build imports Matter.js without runtime errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/BloomPhysicsExperience.jsx src/components/FlowerFallLayer.jsx src/components/FlowerFallLayer.css tests/portfolio.test.mjs
git commit -m "feat: render falling flower physics layer"
```

---

### Task 3: 花冠点击喷发与主花束反弹

**Files:**
- Modify: `src/components/BeeSwarmHero.jsx`
- Modify: `src/components/BeeSwarmHero.css`
- Modify: `src/lib/flowerPhysics.js`
- Modify: `tests/flower-physics.test.mjs`
- Modify: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: `useBloomPhysics().spawnBurst(originRegion)`
- Produces: accessible clickable main flower with `data-bloom-trigger="true"`
- Produces: crown region `{ left, top, width, height }` in viewport coordinates

- [ ] **Step 1: Add failing tests for crown geometry and accessibility**

```js
test("bouquet crown origin excludes the wrapping paper", async () => {
  const { getCrownRegion } = await import("../src/lib/flowerPhysics.js");
  assert.deepEqual(
    getCrownRegion({ left: 100, top: 200, width: 400, height: 500 }),
    { left: 180, top: 290, width: 240, height: 150 },
  );
});

assert.match(homeHtml, /data-bloom-trigger="true"/);
assert.match(homeHtml, /role="button"/);
assert.match(homeHtml, /aria-label="点击花束，让花朵绽放"/);
```

- [ ] **Step 2: Run tests and verify failures**

Run: `node --test tests/flower-physics.test.mjs`

Run: `npm.cmd test -- --test-name-pattern "bouquet"`

Expected: FAIL because crown geometry and trigger markup do not exist.

- [ ] **Step 3: Implement crown-region emission**

On click or Enter/Space, read the untransformed flower bounding rect and convert its crown to horizontal `20%..80%`, vertical `18%..48%`. Call `spawnBurst` with this region and current desktop/mobile count. Do not use the wrapping paper center as the origin.

- [ ] **Step 4: Compose the click impulse with the existing magnet spring**

Add a separate click-spring scalar/offset instead of writing directly over `flowerSpring`. On activation, apply a quick downward compression followed by an underdamped return; compose both values in the final flower transform. Keep the existing `120px` magnet padding, strength `3`, and return spring behavior unchanged.

- [ ] **Step 5: Add interaction styling and accessibility**

Disable native image dragging. Use `role="button"`, `tabIndex="0"`, keyboard activation and a visible `:focus-visible` outline. Keep the native/custom semantic pointer cursor rules intact.

- [ ] **Step 6: Run focused tests**

Run: `node --test tests/flower-physics.test.mjs`

Run: `npm.cmd test -- --test-name-pattern "bouquet"`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/BeeSwarmHero.jsx src/components/BeeSwarmHero.css src/lib/flowerPhysics.js tests/flower-physics.test.mjs tests/portfolio.test.mjs
git commit -m "feat: launch flowers from bouquet crown"
```

---

### Task 4: 跑马灯地面与首页结构集成

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/HomeMarquee.jsx`
- Modify: `src/styles.css`
- Modify: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: `<BloomPhysicsExperience>`
- Consumes: `useBloomPhysics().registerFloor`
- Produces: `.home-marquee[data-flower-floor="true"]`

- [ ] **Step 1: Write a failing test for provider placement and floor registration**

```js
test("hero and marquee share one bloom physics floor", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  const physics = html.match(/<div[^>]*data-bloom-physics="true"[\s\S]*?<\/div><section class="about-section/)?.[0] ?? "";
  assert.match(physics, /class="hero"/);
  assert.match(physics, /data-flower-floor="true"/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm.cmd test -- --test-name-pattern "share one bloom physics floor"`

Expected: FAIL before the wrapper and floor marker are present.

- [ ] **Step 3: Wrap only Hero and HomeMarquee in the provider**

In `HomePage`, wrap the `<section className="hero">` and `<HomeMarquee />` siblings with `BloomPhysicsExperience`. Do not wrap About, Projects, Process or Contact. Pass `burstCount={8}`, `mobileBurstCount={5}`, `maxFlowers={30}`, `settleMs={10000}`, `fadeMs={800}` and the existing local flower sprite path.

- [ ] **Step 4: Register the real marquee element**

Add a wrapper or forwarded ref in `HomeMarquee` with class `home-marquee` and `data-flower-floor="true"`. Register it on mount and unregister it on cleanup. Keep `ScrollVelocity` text, direction, speed and copies unchanged.

- [ ] **Step 5: Preserve layout and stacking**

Ensure the physics provider introduces no margins or containing-block transforms. The flower overlay must remain above the warm paper background and below fixed navigation/clickable Hero copy. The marquee keeps its current height and typography.

- [ ] **Step 6: Run focused tests**

Run: `npm.cmd test -- --test-name-pattern "share one bloom physics floor|home route renders"`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/components/HomeMarquee.jsx src/styles.css tests/portfolio.test.mjs
git commit -m "feat: use marquee edge as flower floor"
```

---

### Task 5: 蜜蜂认领、拖动跟随与恢复原行为

**Files:**
- Modify: `src/components/BeeSwarmHero.jsx`
- Modify: `src/lib/flowerPhysics.js`
- Modify: `tests/flower-physics.test.mjs`
- Modify: `tests/bee-swarm.test.mjs`

**Interfaces:**
- Consumes: `useBloomPhysics().flowerTargetsRef`
- Consumes: `assignBeesToFlowers(bees, flowers, previousAssignments, limit)`
- Produces: per-bee target priority `assigned flower > pointer tracking > idle bouquet`

- [ ] **Step 1: Write failing tests for stable assignment and release**

```js
test("a moving assigned flower keeps its bee until the flower fades", async () => {
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
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `node --test tests/flower-physics.test.mjs tests/bee-swarm.test.mjs`

Expected: FAIL because assignment retention and fading release are not implemented.

- [ ] **Step 3: Implement stable nearest-neighbor assignment**

Retain each previous assignment while the target exists and is either settled or dragging, unless it is fading. Fill remaining bees with nearest unassigned settled flowers. Cap by rendered bee count, so desktop uses at most 10 and mobile at most 6.

- [ ] **Step 4: Feed flower targets into the existing animation loop**

At the beginning of each BeeSwarmHero frame, read `flowerTargetsRef.current`, update assignments and build a lookup. For an assigned bee, set its anchor to `{ x: flower.x, y: flower.y - flower.radius - beeClearance }`. Keep organic steering but reduce orbit spread so the bee appears stopped/hovering over the flower. Dragging updates use the same live coordinates.

- [ ] **Step 5: Restore existing priority when targets disappear**

When a flower enters fading, remove it from assignment input immediately. Its bee must fall through to another stable flower if one exists; otherwise use the current `tracksPointer ? pointer : flowerCenter` behavior without resetting velocity or teleporting.

- [ ] **Step 6: Run focused tests**

Run: `node --test tests/flower-physics.test.mjs tests/bee-swarm.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/BeeSwarmHero.jsx src/lib/flowerPhysics.js tests/flower-physics.test.mjs tests/bee-swarm.test.mjs
git commit -m "feat: let bees follow settled flowers"
```

---

### Task 6: 生命周期、性能与完整验收

**Files:**
- Modify: `src/components/FlowerFallLayer.jsx`
- Modify: `src/components/FlowerFallLayer.css`
- Modify: `tests/flower-physics.test.mjs`
- Modify: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes all previous task interfaces
- Produces final tested interaction with no behavior changes outside Hero and marquee

- [ ] **Step 1: Add failing tests for pause and reduced-motion behavior**

Add assertions that the provider declares pause conditions for hidden document, offscreen range and reduced motion; assert desktop/mobile burst counts, maximum flower count, 10-second lifetime and 800ms fade remain visible in the SSR data contract.

- [ ] **Step 2: Run the new tests and verify failures**

Run: `node --test tests/flower-physics.test.mjs`

Run: `npm.cmd test -- --test-name-pattern "bloom physics"`

Expected: FAIL until pause metadata and cleanup behavior are complete.

- [ ] **Step 3: Complete pause, resize and cleanup handling**

Pause Matter Runner/RAF when the provider is outside the Hero-to-marquee range or `document.hidden`; resume without adding an oversized time delta. Rebuild walls/floor on ResizeObserver changes. On unmount release pointer capture, cancel RAF, disconnect observers, remove bodies and clear the engine.

- [ ] **Step 4: Verify reduced-motion and input fallbacks**

Under reduced motion, clicking the bouquet only runs the short press state and never queues a burst. Without Pointer Events, falling and expiration still work but dragging is absent. Missing sprite assets hide only failed flower nodes.

- [ ] **Step 5: Run the complete automated suite**

Run: `npm.cmd test`

Expected: all existing and new tests PASS.

- [ ] **Step 6: Run the production build**

Run: `npm.cmd run build`

Expected: build succeeds; no missing Matter.js import and no new production error.

- [ ] **Step 7: Perform local browser verification**

At approximately 1440px and 390px widths verify: crown-only emission, 8/5 counts, quiet non-bouncing landing, exact marquee-top collision, desktop drag, bee attachment above flowers, 10-second fade, bee reassignment/recovery, no horizontal overflow and no console errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/FlowerFallLayer.jsx src/components/FlowerFallLayer.css tests/flower-physics.test.mjs tests/portfolio.test.mjs
git commit -m "test: verify bloom fall lifecycle"
```

