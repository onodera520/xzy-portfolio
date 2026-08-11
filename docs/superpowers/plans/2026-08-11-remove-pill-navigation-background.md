# Remove Pill Navigation Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the desktop pill group’s black outer background while preserving white pills, Chinese labels, and the black hover-fill animation.

**Architecture:** Use the existing `frameless` presentation path instead of changing `--pill-base`, because the same base color drives the hover circle. Enable that path only for the homepage `PillNav`, then keep the desktop pill height consistent with the current visible pill height. Mobile menu styling remains unchanged.

**Tech Stack:** React 19, GSAP 3, Vite 8, Node test runner, CSS.

## Global Constraints

- Remove only the five desktop pills’ outer black base.
- Preserve each white pill, Chinese label, black hover fill, and white hover text.
- Do not change the mobile menu, logo, CV button, mail button, routes, or section anchors.
- Add no dependency and do no unrelated refactoring.
- Preserve all pre-existing uncommitted work.

---

### Task 1: Enable the transparent desktop pill group

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `src/App.jsx`
- Modify: `src/components/PillNav.css`

**Interfaces:**
- Consumes: `PillNav({ frameless, ...props })` and the existing `.pill-nav--frameless` selectors.
- Produces: homepage markup with the `pill-nav--frameless` class and desktop CSS with a transparent outer base while `.pill-hover-circle` remains black.

- [ ] **Step 1: Write the failing regression test**

Add a test that renders the homepage and checks that its `PillNav` opts into `frameless`, then assert the CSS contract keeps the frame transparent and the hover circle on `var(--pill-base)`:

```js
test("homepage removes the desktop pill base without removing the black hover fill", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  const css = readFileSync(resolve(rootDir, "src/components/PillNav.css"), "utf8");

  assert.match(html, /pill-nav pill-nav--frameless/);
  assert.match(css, /\.pill-nav--frameless \.pill-nav-desktop\s*\{[^}]*background:\s*transparent;/s);
  assert.match(css, /\.pill-hover-circle\s*\{[^}]*background:\s*var\(--pill-base\);/s);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="removes the desktop pill base" tests/portfolio.test.mjs`

Expected: FAIL because the homepage does not yet render `pill-nav--frameless`.

- [ ] **Step 3: Enable the existing frameless mode and preserve pill geometry**

Pass `frameless` to the homepage `PillNav` in `src/App.jsx`. In `src/components/PillNav.css`, keep the frameless desktop group transparent and set its height/padding/gap so the visible pills retain their current 36px height and 3px spacing:

```css
.pill-nav--frameless .pill-nav-desktop {
  height: 36px;
  background: transparent;
}

.pill-nav--frameless .pill-list {
  padding: 0;
  gap: 3px;
}
```

Do not modify `.pill-hover-circle { background: var(--pill-base); }` or mobile selectors.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test --test-name-pattern="removes the desktop pill base" tests/portfolio.test.mjs`

Expected: PASS.

- [ ] **Step 5: Run full verification**

Run: `npm.cmd run check`

Expected: all Node tests pass and the Vite production build exits 0.

- [ ] **Step 6: Verify in the local browser**

At `http://localhost:3000/`, confirm the desktop group has no black area between or around the white pills, each pill still fills black on hover, and the 390px mobile menu remains unchanged without horizontal overflow.
