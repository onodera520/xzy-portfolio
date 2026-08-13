# Pill Navigation Single Entrance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the desktop navigation entrance animation on first mount while preventing brand-contrast and navigation-data rerenders from replaying it.

**Architecture:** Separate hover geometry/timeline setup from the desktop entrance effect. Add a component-lifetime entrance latch so only the first entrance decision can animate; later effect executions normalize the element without replaying the transition.

**Tech Stack:** React 19, GSAP 3, Vite 8, Node test runner.

## Global Constraints

- Preserve the existing 0.6 second first-load entrance.
- Brand contrast changes must not replay opacity, vertical movement, or horizontal scale animation.
- Preserve pill hover animation, mobile menu, Chinese labels, routes, and visual styling.
- Add no dependencies and preserve pre-existing uncommitted work.

---

### Task 1: Make the entrance decision component-lifetime only

**Files:**
- Create: `src/lib/entranceLatch.js`
- Create: `tests/entrance-latch.test.mjs`
- Modify: `src/components/PillNav.jsx`

**Interfaces:**
- Produces: `createEntranceLatch()` returning `{ shouldAnimate(enabled, reducedMotion): boolean }`.
- Consumes: the latch inside `PillNav` through a stable `useRef`.

- [ ] **Step 1: Write a failing latch test**

Verify that the first enabled call returns `true`, later calls return `false`, and a newly created latch can animate again.

- [ ] **Step 2: Verify RED**

Run `node --test tests/entrance-latch.test.mjs`. Expect module-not-found because the latch does not exist.

- [ ] **Step 3: Implement the latch and split effects**

Create the latch. Keep hover layout/timeline setup in an effect depending on `ease` and `items`. Move `.pill-nav-desktop` entrance into a separate effect depending only on `ease` and `initialLoadAnimation`, and consult the latch before `gsap.fromTo`.

- [ ] **Step 4: Verify GREEN**

Run `node --test tests/entrance-latch.test.mjs` and expect all tests to pass.

- [ ] **Step 5: Verify application behavior**

Run `npm.cmd run check`. In `http://localhost:3000/`, confirm the initial entrance remains, scroll from `#work` into the dark design-process region, and verify the navigation retains normal opacity/position/scale while the brand contrast changes. Confirm hover remains animated and the console has no errors.
