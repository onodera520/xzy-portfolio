# Adaptive Brand Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the fixed sidebar trigger and `XUE STUDIO` wordmark legible by switching them to black over declared light sections and white over declared dark sections.

**Architecture:** Page sections declare `data-brand-contrast="light|dark"`. A focused `useBrandContrast` hook observes those sections and samples the fixed brand position on scroll/resize, using a pure selector function for deterministic tests. `Navigation` owns the current theme and exposes it through `data-brand-contrast`, while the trigger and wordmark inherit one CSS custom property.

**Tech Stack:** React 19, browser `IntersectionObserver`, `requestAnimationFrame`, CSS custom properties, Node test runner, Vite.

## Global Constraints

- Only the sidebar trigger and `XUE STUDIO` wordmark change color.
- Light beige/white sections use black; black/deep-blue sections use white.
- The sidebar open state keeps the trigger black over its warm-white panel.
- Use preset section themes, never runtime pixel analysis.
- Use an approximately 200ms color transition and honor reduced motion.
- Do not add dependencies, modify portfolio image content, or deploy publicly.
- Preserve all unrelated uncommitted workspace changes.

---

### Task 1: Deterministic contrast selection

**Files:**
- Create: `src/lib/brandContrast.js`
- Test: `tests/brand-contrast.test.mjs`

**Interfaces:**
- Produces: `normalizeBrandContrast(value, fallback): "light" | "dark"`
- Produces: `selectBrandContrast(regions, sampleY, fallback): "light" | "dark"`, where each region is `{ theme, top, bottom }`.

- [ ] Write tests with literal regions proving that a containing dark region returns `dark`, a containing light region returns `light`, overlapping regions choose the last/nested visual region, and a gap returns the supplied fallback.
- [ ] Run `node --test tests/brand-contrast.test.mjs`; expect failure because the module does not exist.
- [ ] Implement normalization and containment selection with no DOM dependency.
- [ ] Re-run the focused test; expect all assertions to pass.

### Task 2: Scroll-aware React hook and Navigation output

**Files:**
- Create: `src/hooks/useBrandContrast.js`
- Modify: `src/App.jsx`
- Modify: `src/components/StaggeredMenu.jsx`
- Modify: `src/components/StaggeredMenu.css`
- Modify: `src/styles.css`
- Test: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: `selectBrandContrast` from Task 1.
- Produces: `useBrandContrast({ defaultTheme, sampleSelector, regionSelector }): "light" | "dark"`.
- `Navigation` renders `data-brand-contrast="light|dark"` and `.nav-brand` inherits `--brand-contrast-color`.
- `StaggeredMenu` accepts `triggerTone="inherit"` without adding a fixed dark/light trigger color.

- [ ] Add an SSR test asserting home and case navigation expose a contrast theme, both the wordmark and trigger remain inside `.nav-brand`, and the trigger uses inheritance rather than a route-fixed tone.
- [ ] Run `npm.cmd test`; expect the new assertions to fail because adaptive output is absent.
- [ ] Implement the hook: query declared regions, use `IntersectionObserver` for region changes, throttle scroll/resize reads with `requestAnimationFrame`, sample at the vertical center of `.nav-brand`, and clean up all listeners/observers/frames.
- [ ] Integrate the hook into `Navigation`, pass `triggerTone="inherit"`, and add 200ms current-color transitions plus a zero-duration reduced-motion override.
- [ ] Run `npm.cmd test`; expect the suite to pass.

### Task 3: Declare home and portfolio contrast regions

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/DesignProcess.jsx`
- Modify: `src/components/FigmaCaseStudy.jsx`
- Modify: `src/components/CaseOtherLink.jsx`
- Modify: `src/data/portfolioCases.js`
- Test: `tests/portfolio.test.mjs`

**Interfaces:**
- Frame objects gain `brandContrast: "light" | "dark"`.
- `PortfolioBoard` renders the frame value as `data-brand-contrast` on its outer entry.
- Home light regions: Hero, marquee/ambient beige content, About, Work.
- Home dark regions: Design Process, Contact, Footer.
- Case toolbar/list gaps default to light; dark frame presets are:
  - consumer: frames 04 and 12.
  - enterprise: frames 01, 02, 03, 07, 10, 11, and 13.
  - campaign: frame 01.
- Case “other projects” footer is dark.

- [ ] Add data tests asserting every frame has a valid theme and exact dark-frame numbers, plus render tests for home and all three cases.
- [ ] Run `npm.cmd test`; expect failure because regions and frame themes are missing.
- [ ] Add explicit section attributes and frame theme arrays, without changing image content or order.
- [ ] Re-run `npm.cmd test`; expect all tests to pass.

### Task 4: Verification and responsive browser acceptance

**Files:**
- Verify only; modify implementation files only if a reproduced defect requires a new failing regression test.

**Interfaces:**
- No new public interface.

- [ ] Run `npm.cmd test`, `npm.cmd run build`, and `git diff --check`; require zero failures.
- [ ] In a browser, verify the homepage brand is black over Hero/Work, white over Design Process/Contact, and returns correctly when scrolling upward.
- [ ] Verify C/B/H5 cases switch at their declared dark/light boards, with the sidebar trigger forced black only while open.
- [ ] Verify at desktop and 390px widths that the brand remains visible, transitions without flashing, has no horizontal overflow, and produces no console errors.
- [ ] Keep implementation changes local and uncommitted because the modified source/test files already contain the user's uncommitted visual baseline.
