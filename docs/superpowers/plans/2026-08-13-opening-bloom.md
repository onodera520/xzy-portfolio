# Opening Bloom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为首页增加一次性花朵开屏：中心花朵弹出、缓慢旋转，点击后花朵剪影放大并揭示现有首页。

**Architecture:** 新建独立 `OpeningBloom` 覆盖层，不侵入 `BeeSwarmHero`、Matter 落花或首页内容状态。会话判断和存储容错放在纯函数模块中；视觉揭示由全屏 SVG luminance mask 完成，固定米色覆盖层下方的首页始终保持已布局状态。

**Tech Stack:** React 19、Vite 8、CSS、SVG mask、原生 `sessionStorage`、Node test runner。

## Global Constraints

- 背景固定使用暖米色 `#f7f6f2`。
- 同一浏览会话只播放一次；刷新和从案例返回首页不重复播放。
- 不新增 npm 依赖，不请求远程素材，复用 `/hero/design-in-bloom/flower-sprite.png`。
- 不修改首页蜂群、花束点击、落花物理、10 秒消散、导航、作品与案例路由。
- 点击、触摸、`Enter`、`Space` 均可进入；重复触发只能执行一次。
- `prefers-reduced-motion: reduce` 使用约 `200ms` 交叉淡入，不旋转、不做大幅缩放。
- 覆盖层完成后必须卸载并恢复页面滚动；异常时不能阻塞首页。
- 本地运行，不部署公网。

---

## File Structure

- Create `src/lib/openingBloom.js`: 会话存储安全读写、状态转换与键盘触发判断。
- Create `src/components/OpeningBloom.jsx`: 开屏生命周期、交互和无障碍语义。
- Create `src/components/OpeningBloom.css`: 米色画布、弹簧入场、慢速旋转、SVG 花朵剪影揭示和 reduced-motion。
- Modify `src/App.jsx`: 仅在 `HomePage` 顶层挂载开屏，不改变现有首页子树。
- Create `tests/opening-bloom.test.mjs`: 纯逻辑、SSR 结构、会话和交互契约测试。
- Modify `tests/portfolio.test.mjs`: 首页整体结构回归断言。

### Task 1: 会话状态与一次性触发逻辑

**Files:**
- Create: `src/lib/openingBloom.js`
- Create: `tests/opening-bloom.test.mjs`

**Interfaces:**
- Produces: `OPENING_BLOOM_STORAGE_KEY: string`
- Produces: `hasOpeningBloomPlayed(storage, key): boolean`
- Produces: `markOpeningBloomPlayed(storage, key): boolean`
- Produces: `isOpeningBloomActivationKey(key): boolean`
- Produces: `getNextOpeningBloomPhase(phase, event): "idle" | "arriving" | "ready" | "revealing" | "complete"`

- [ ] **Step 1: Write failing pure-logic tests**

```js
import assert from "node:assert/strict";
import { test } from "node:test";

test("opening bloom storage helpers survive unavailable session storage", async () => {
  const {
    OPENING_BLOOM_STORAGE_KEY,
    hasOpeningBloomPlayed,
    markOpeningBloomPlayed,
  } = await import("../src/lib/openingBloom.js");
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(hasOpeningBloomPlayed(storage, OPENING_BLOOM_STORAGE_KEY), false);
  assert.equal(markOpeningBloomPlayed(storage, OPENING_BLOOM_STORAGE_KEY), true);
  assert.equal(hasOpeningBloomPlayed(storage, OPENING_BLOOM_STORAGE_KEY), true);
  const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.equal(hasOpeningBloomPlayed(blocked), false);
  assert.equal(markOpeningBloomPlayed(blocked), false);
});

test("opening bloom only accepts activation keys and never restarts revealing", async () => {
  const { getNextOpeningBloomPhase, isOpeningBloomActivationKey } = await import("../src/lib/openingBloom.js");
  assert.equal(isOpeningBloomActivationKey("Enter"), true);
  assert.equal(isOpeningBloomActivationKey(" "), true);
  assert.equal(isOpeningBloomActivationKey("Escape"), false);
  assert.equal(getNextOpeningBloomPhase("ready", "activate"), "revealing");
  assert.equal(getNextOpeningBloomPhase("revealing", "activate"), "revealing");
  assert.equal(getNextOpeningBloomPhase("revealing", "finish"), "complete");
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/opening-bloom.test.mjs`

Expected: FAIL because `src/lib/openingBloom.js` does not exist.

- [ ] **Step 3: Implement the minimal pure helpers**

```js
export const OPENING_BLOOM_STORAGE_KEY = "xue-studio:opening-bloom:played";

export function hasOpeningBloomPlayed(storage, key = OPENING_BLOOM_STORAGE_KEY) {
  try { return storage?.getItem(key) === "1"; } catch { return false; }
}

export function markOpeningBloomPlayed(storage, key = OPENING_BLOOM_STORAGE_KEY) {
  try { storage?.setItem(key, "1"); return Boolean(storage); } catch { return false; }
}

export function isOpeningBloomActivationKey(key) {
  return key === "Enter" || key === " ";
}

export function getNextOpeningBloomPhase(phase, event) {
  if (event === "finish" && phase === "revealing") return "complete";
  if (event === "activate" && (phase === "arriving" || phase === "ready")) return "revealing";
  if (event === "arrive" && phase === "idle") return "arriving";
  if (event === "ready" && phase === "arriving") return "ready";
  return phase;
}
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `node --test tests/opening-bloom.test.mjs`

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/openingBloom.js tests/opening-bloom.test.mjs
git commit -m "test: define opening bloom lifecycle"
```

### Task 2: 可访问的 OpeningBloom 组件

**Files:**
- Create: `src/components/OpeningBloom.jsx`
- Modify: `tests/opening-bloom.test.mjs`

**Interfaces:**
- Consumes: Task 1 exports from `src/lib/openingBloom.js`
- Produces: `OpeningBloom({ flowerSrc, storageKey, onComplete })`
- DOM contract: root `data-opening-bloom`, phase `data-opening-phase`, button label `点击花朵进入 XUE STUDIO`, SVG mask `data-opening-mask`

- [ ] **Step 1: Add a failing SSR structure test**

```js
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import react from "@vitejs/plugin-react";
import { after, before } from "node:test";
import { createServer } from "vite";

let vite;
before(async () => {
  vite = await createServer({ configFile: false, appType: "custom", logLevel: "silent", plugins: [react()], server: { middlewareMode: true } });
});
after(async () => vite?.close());

test("OpeningBloom exposes one accessible flower and an SVG reveal mask", async () => {
  const { default: OpeningBloom } = await vite.ssrLoadModule("/src/components/OpeningBloom.jsx");
  const html = renderToStaticMarkup(React.createElement(OpeningBloom, { flowerSrc: "/hero/design-in-bloom/flower-sprite.png" }));
  assert.match(html, /data-opening-bloom="true"/);
  assert.match(html, /data-opening-phase="idle"/);
  assert.match(html, /aria-label="点击花朵进入 XUE STUDIO"/);
  assert.match(html, /data-opening-mask="true"/);
  assert.equal((html.match(/flower-sprite\.png/g) ?? []).length, 2);
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run: `node --test --test-name-pattern="OpeningBloom exposes" tests/opening-bloom.test.mjs`

Expected: FAIL because `OpeningBloom.jsx` does not exist.

- [ ] **Step 3: Implement component lifecycle and cleanup**

Implement `OpeningBloom.jsx` with these concrete behaviors:

```jsx
const ARRIVAL_DELAY_MS = 300;
const READY_DELAY_MS = 900;
const REVEAL_DURATION_MS = 820;
const REDUCED_REVEAL_DURATION_MS = 200;
```

- Initialize phase as `idle` and render the overlay for SSR resilience.
- On mount, safely read `sessionStorage`; if played, set phase `complete` immediately.
- Otherwise lock `document.documentElement.style.overflow = "hidden"`, schedule `arriving` at 300ms and `ready` at 900ms.
- `activate()` changes only `arriving` or `ready` to `revealing`; it detects reduced motion and schedules completion at 200ms or 820ms.
- Completion writes the session marker, restores the prior overflow value, invokes `onComplete`, and returns `null` after phase becomes `complete`.
- `onKeyDown` prevents default only for Enter and Space before calling `activate()`.
- `onError` calls completion immediately so a broken flower can never trap the user.
- Cleanup clears every timer and restores the exact previous overflow value.
- Render a button containing the visible flower image and prompt `点击绽放`.
- Render a full-viewport SVG with a unique `useId()` mask: white rect plus black flower image centered in the mask; apply the mask to a米色 rect.

- [ ] **Step 4: Run focused and full component tests**

Run: `node --test tests/opening-bloom.test.mjs`

Expected: all opening-bloom tests pass without React warnings.

- [ ] **Step 5: Commit**

```powershell
git add src/components/OpeningBloom.jsx tests/opening-bloom.test.mjs
git commit -m "feat: add accessible opening bloom overlay"
```

### Task 3: 花朵弹出、旋转与剪影揭示视觉

**Files:**
- Create: `src/components/OpeningBloom.css`
- Modify: `src/components/OpeningBloom.jsx`
- Modify: `tests/opening-bloom.test.mjs`

**Interfaces:**
- Consumes DOM phase contract from Task 2.
- Produces CSS animation names `opening-flower-arrive`, `opening-flower-drift`, `opening-mask-reveal`, `opening-overlay-fade`.

- [ ] **Step 1: Add failing CSS contract tests**

```js
import fs from "node:fs";

test("opening bloom CSS contains the reveal and reduced-motion paths", () => {
  const css = fs.readFileSync(new URL("../src/components/OpeningBloom.css", import.meta.url), "utf8");
  assert.match(css, /@keyframes opening-flower-arrive/);
  assert.match(css, /@keyframes opening-mask-reveal/);
  assert.match(css, /data-opening-phase="revealing"/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /transition:\s*all/);
});
```

- [ ] **Step 2: Run the CSS test and verify RED**

Run: `node --test --test-name-pattern="opening bloom CSS" tests/opening-bloom.test.mjs`

Expected: FAIL because `OpeningBloom.css` does not exist.

- [ ] **Step 3: Implement the visual states**

Create `OpeningBloom.css` with these exact design values:

- `.opening-bloom`: `position: fixed; inset: 0; z-index: 10000; background: #f7f6f2; overflow: hidden; isolation: isolate`.
- Flower button: transparent border/background, native focus ring only on `:focus-visible`, centered with CSS grid.
- Initial flower: `width: clamp(112px, 12vw, 176px); opacity: 0; transform: scale(.58) rotate(-8deg)`.
- Arrival: `620ms cubic-bezier(.16, 1.35, .3, 1)` to opacity 1 and scale 1.
- Ready drift: alternating `7.5s ease-in-out infinite` between roughly `-4deg` and `5deg`; no full mechanical rotation.
- Active press: scale `.92` using a `120ms` transform transition.
- Reveal: visible button scales from 1 to 1.18 and fades during first 240ms; SVG mask image scales from 1 to enough to cover `320vmax` in `820ms cubic-bezier(.16, 1, .3, 1)`.
- Beige masked rect remains above the homepage while its flower-shaped hole expands.
- Prompt uses 12px PingFang system stack, 0.12em tracking and 56% black.
- Reduced motion: disable arrival/drift/mask keyframes, fade the entire overlay over 200ms.
- Gate pointer hover styling behind `(hover: hover) and (pointer: fine)`.

Import the stylesheet from `OpeningBloom.jsx`.

- [ ] **Step 4: Run the tests and build**

Run: `node --test tests/opening-bloom.test.mjs`

Expected: all opening-bloom tests pass.

Run: `npm.cmd run build`

Expected: Vite build exits 0.

- [ ] **Step 5: Commit**

```powershell
git add src/components/OpeningBloom.jsx src/components/OpeningBloom.css tests/opening-bloom.test.mjs
git commit -m "feat: animate flower silhouette reveal"
```

### Task 4: 首页集成与既有互动回归

**Files:**
- Modify: `src/App.jsx:136-225`
- Modify: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: `OpeningBloom` from Task 2.
- Keeps all existing `HomePage` descendants unchanged.

- [ ] **Step 1: Add a failing homepage integration test**

Append to the existing home-route assertions:

```js
test("home route mounts one opening bloom without replacing the hero", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  assert.equal((html.match(/data-opening-bloom="true"/g) ?? []).length, 1);
  assert.match(html, /aria-label="点击花朵进入 XUE STUDIO"/);
  assert.match(html, /data-bee-swarm="true"/);
  assert.match(html, /data-bloom-physics="true"/);
  assert.match(html, /DESIGN IN BLOOM/);
});
```

- [ ] **Step 2: Run the integration test and verify RED**

Run: `node --test --test-name-pattern="home route mounts one opening bloom" tests/portfolio.test.mjs`

Expected: FAIL because the homepage has not mounted `OpeningBloom`.

- [ ] **Step 3: Mount the overlay at the HomePage boundary**

Add:

```jsx
import OpeningBloom from "./components/OpeningBloom.jsx";
```

Render exactly once as the first element in `HomePage`:

```jsx
<OpeningBloom flowerSrc="/hero/design-in-bloom/flower-sprite.png" />
```

Do not wrap or conditionally remount `Navigation`, `BloomPhysicsExperience`, `BeeSwarmHero`, or any homepage section.

- [ ] **Step 4: Run focused and complete automated verification**

Run: `node --test --test-name-pattern="home route mounts one opening bloom" tests/portfolio.test.mjs`

Expected: focused integration test passes.

Run: `npm.cmd test`

Expected: zero failed tests.

Run: `npm.cmd run build`

Expected: Vite build exits 0; the existing bundle-size advisory is acceptable because no dependency was added.

- [ ] **Step 5: Commit**

```powershell
git add src/App.jsx tests/portfolio.test.mjs
git commit -m "feat: add opening bloom to homepage"
```

### Task 5: 本地浏览器行为验收

**Files:**
- Modify only if browser evidence exposes a defect in Tasks 1–4.

**Interfaces:**
- Verifies the complete user-visible flow at `http://127.0.0.1:3000/`.

- [ ] **Step 1: Start or reuse the local Vite server**

Run: `npm.cmd run dev`

Expected: page is available at `http://127.0.0.1:3000/`.

- [ ] **Step 2: Verify first-visit desktop flow**

- Open a fresh browser session and clear only `sessionStorage["xue-studio:opening-bloom:played"]` for the local page.
- Confirm an empty米色 frame appears first, then one centered flower arrives.
- Confirm the flower drifts subtly instead of making continuous full rotations.
- Click the flower and confirm the homepage is first visible through the flower silhouette, then fills the viewport without a white flash.
- Confirm the overlay is removed and the page scrolls normally.

- [ ] **Step 3: Verify session and input behavior**

- Reload and confirm the overlay does not return.
- Navigate to a case and back; confirm it does not return.
- In a fresh session, press Tab until the flower is focused, then Enter; repeat with Space in another fresh session.
- Confirm repeated click/keypress during reveal does not restart or flicker.

- [ ] **Step 4: Verify responsive and motion fallback**

- At approximately 390px width, confirm the flower remains centered and the reveal covers every corner.
- Emulate reduced motion and confirm the overlay cross-fades in about 200ms without rotation or zoom-through.
- Temporarily request a missing flower asset and confirm the homepage becomes usable immediately.

- [ ] **Step 5: Verify existing homepage interactions**

- Click the homepage bouquet and confirm flower burst still works.
- Drag one landed flower upward and confirm gravity, bee following and 10-second disappearance still work.
- Confirm navigation, 查看作品 button and all three project entries remain interactive.
- Inspect browser console and require zero runtime errors.

- [ ] **Step 6: Run final verification and commit any browser-derived fix**

Run: `npm.cmd test`

Run: `npm.cmd run build`

Run: `git diff --check`

Expected: all commands exit 0. If browser verification required a code fix, commit only that fix and its regression test with `git commit -m "fix: polish opening bloom transition"`.

## Plan Self-Review

- Spec coverage: every playback, timing, input, mask, storage, fallback, cleanup, reduced-motion and regression requirement maps to Tasks 1–5.
- Placeholder scan: no deferred implementation markers or undefined follow-up work remain.
- Interface consistency: the component, helper names, storage key, DOM attributes and test selectors are identical across all tasks.
- Scope: the plan changes only the opening overlay and homepage mount point; existing hero and physics components remain isolated.
