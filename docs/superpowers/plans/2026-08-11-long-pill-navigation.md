# Long Pill Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the five desktop navigation items inside one white capsule, keep each item transparent until hover/focus, and remove the detail-page active dot.

**Architecture:** Keep the existing `PillNav` markup and GSAP hover circle. Stop enabling `frameless` in the shared navigation, make the default pill background transparent through `pillColor`, style the desktop shell as the white capsule, and remove the active-dot pseudo-element without changing mobile selectors.

**Tech Stack:** React 19, GSAP 3, Vite 8, Node test runner, CSS.

## Global Constraints

- Preserve Chinese labels, links, hover animation, keyboard focus, mobile navigation, logo, CV, and mail actions.
- No persistent black active item and no active dot.
- Add no dependency and preserve existing uncommitted work.

---

### Task 1: Restore one shared desktop capsule

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `src/App.jsx`
- Modify: `src/components/PillNav.jsx`
- Modify: `src/components/PillNav.css`

**Interfaces:**
- Consumes: `PillNav({ pillColor, activeHref, ...props })` and the existing `.pill-hover-circle` animation.
- Produces: a white `.pill-nav-desktop`, transparent `.pill` items, and no `.pill.is-active::after` marker.

- [ ] **Step 1: Write a failing SSR behavior test**

Render `/` and `/work/consumer`. Assert the navigation does not use `pill-nav--frameless`, uses `--pill-bg:transparent`, retains five hover circles, and does not emit `is-active` for the desktop project link.

- [ ] **Step 2: Verify RED**

Run `node --test --test-name-pattern="one shared capsule" tests/portfolio.test.mjs`. Expect failure because the shared navigation still enables `frameless` and the pill background is white.

- [ ] **Step 3: Implement the minimal presentation change**

Remove `frameless` from `Navigation`, set `PillNav`'s default `pillColor` to `transparent`, give `.pill-nav-desktop` a white background with a subtle gray border, and remove `.pill.is-active::after`. Preserve `.pill-hover-circle { background: var(--pill-base); }`.

- [ ] **Step 4: Verify GREEN**

Run the focused test and expect it to pass.

- [ ] **Step 5: Verify the full application**

Run `npm.cmd run check`, then inspect `http://localhost:3000/` at desktop and 390px widths. Confirm one white shell, transparent idle items, black hover fill, no detail-page dot, no overflow, and no browser errors.
