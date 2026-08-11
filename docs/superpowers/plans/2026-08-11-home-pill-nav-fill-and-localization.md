# Home Pill Navigation Fill and Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every homepage pill hover fill as completely as the working PROJECTS item and replace the five English navigation labels with Chinese.

**Architecture:** Keep the existing `PillNav` integration but restore the user-provided React Bits behavior: a black base, white pills, and one shared circle animation from scale 0 to 1.2 with 0.3/0.2 second interaction timing. Omit the reference component's logo/icon and keep navigation labels in the existing `Navigation` item array so desktop and mobile remain synchronized.

**Tech Stack:** React 19, GSAP 3, Vite 8, Node test runner, CSS.

## Global Constraints

- Use the supplied React Bits PillNav JavaScript + CSS as the only interaction reference.
- Labels must be `关于`、`作品`、`过程`、`互动实验`、`联系` in that order.
- Preserve anchors `#about`、`#work`、`#process`、`#lab`、`#contact`.
- Do not change the logo, sidebar menu, CV, mail action, routes, mobile behavior, keyboard focus, or reduced-motion handling.
- Add no dependencies and do no unrelated refactoring.
- Preserve all pre-existing uncommitted work; do not commit production files that contain unrelated changes.

---

### Task 1: Localize the shared navigation data

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `src/App.jsx:87-95`

**Interfaces:**
- Consumes: `Navigation({ homeLinks, inverted, motionProfile })` and its existing `items` array.
- Produces: five Chinese `item.label` values while retaining the existing `href` values.

- [ ] **Step 1: Write the failing SSR test**

Add a test that renders `App` at `/` and checks the five navigation anchors by accessible label:

```js
test("homepage navigation uses Chinese labels with the existing section anchors", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  for (const [label, href] of [
    ["关于", "#about"],
    ["作品", "#work"],
    ["过程", "#process"],
    ["互动实验", "#lab"],
    ["联系", "#contact"],
  ]) {
    assert.match(html, new RegExp(`<a href="${href}"[^>]*aria-label="${label}"`));
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --test-name-pattern="homepage navigation uses Chinese labels" tests/portfolio.test.mjs`

Expected: FAIL because the rendered labels are still ABOUT, PROJECTS, PROCESS, LAB, CONTACT.

- [ ] **Step 3: Replace only the labels in `src/App.jsx`**

```js
const items = [
  { label: "关于", href: `${anchor}about` },
  { label: "作品", href: `${anchor}work` },
  { label: "过程", href: `${anchor}process` },
  { label: "互动实验", href: `${anchor}lab` },
  { label: "联系", href: `${anchor}contact` },
];
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test --test-name-pattern="homepage navigation uses Chinese labels" tests/portfolio.test.mjs`

Expected: PASS.

---

### Task 2: Restore the standard React Bits PillNav behavior

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `src/App.jsx`
- Modify: `src/components/PillNav.jsx`
- Modify: `src/components/PillNav.css`

**Interfaces:**
- Consumes: the current `PillNav` items and the supplied React Bits source.
- Produces: standard black-base/white-pill color variables, fixed 1.2 fill scale, 0.3/0.2 second interaction timing, and no PillNav logo/icon.

- [ ] **Step 1: Write failing component contract tests**

Render the home page and `PillNav`, then assert that the Apple profile is absent, the standard CSS variables are present, and no `.pill-logo` or image is rendered inside the component.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test --test-name-pattern="standard React Bits|standard black base" tests/portfolio.test.mjs`

Expected: FAIL because the homepage still emits `data-motion-profile="apple"` and the component has no standard color variables.

- [ ] **Step 3: Restore the supplied component behavior**

Remove the homepage-only `motionProfile="apple"` branch. Set every hover circle from `scale: 0` to `scale: 1.2`, keep the supplied 0.3 second enter and 0.2 second leave timing, expose black-base/white-pill CSS variables, and omit the reference `.pill-logo` markup.

- [ ] **Step 4: Run the standard component and navigation tests and verify GREEN**

Run: `node --test --test-name-pattern="standard React Bits|standard black base|homepage navigation uses Chinese labels" tests/portfolio.test.mjs`

Expected: all tests PASS.

---

### Task 3: Verify the complete change

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/components/PillNav.jsx`
- Verify: `src/lib/pillGeometry.js`
- Verify: `tests/pill-geometry.test.mjs`
- Verify: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: the completed localized labels and width-aware hover scale.
- Produces: a regression-checked local homepage without white hover gaps.

- [ ] **Step 1: Run the full automated check**

Run: `npm.cmd run check`

Expected: zero test failures and a successful Vite production build.

- [ ] **Step 2: Inspect the homepage interaction**

At `http://localhost:3000/`, hover `关于`, `作品`, `过程`, `互动实验`, and `联系`. Confirm every final hover state is an edge-to-edge black capsule with white text and that all links still target their original sections.

- [ ] **Step 3: Check the mobile navigation**

At a 390px viewport, open the menu and confirm all five Chinese labels render without horizontal overflow.

- [ ] **Step 4: Review the final diff**

Confirm no files outside the five listed implementation/test files changed and preserve the user’s pre-existing modifications in `src/App.jsx` and `tests/portfolio.test.mjs`.
