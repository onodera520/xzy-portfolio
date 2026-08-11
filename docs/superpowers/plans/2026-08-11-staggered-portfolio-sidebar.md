# Staggered Portfolio Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing top-left home link with a reusable left-side StaggeredMenu containing grouped bilingual site navigation, Chinese project shortcuts, and a restrained bee hover treatment.

**Architecture:** A dedicated data module defines menu groups and links. A focused `StaggeredMenu` component owns GSAP timelines, open state, focus, Escape/click-away handling, and scroll locking; `Navigation` only supplies the current light/dark trigger treatment and renders the component in the existing top-left slot.

**Tech Stack:** React 19, Vite 8, GSAP 3.15, CSS, Node test runner with React server rendering.

## Global Constraints

- Position is left; desktop panel width is `clamp(480px, 42vw, 560px)` and mobile width is `100vw`.
- Underlays are exactly `#0B0B0B`, `#454541`, and `#C8C6BF`; panel is `#F7F6F2`.
- Sidebar files must not use `#b8ff68` or another saturated accent.
- Group headings are bilingual and child links are Chinese; every child is always visible.
- Existing `/hero/design-in-bloom/bee.png` is the only bee asset.
- The bee appears only for group heading hover/focus, never for child links, and does not alter layout.
- AI Product is visibly disabled and does not render an anchor.
- Desktop PillNav remains; its mobile menu is hidden so only StaggeredMenu controls mobile navigation.
- Existing project pages, artboards, homepage content, and local-only workflow remain unchanged.
- `src/App.jsx`, `src/styles.css`, and `tests/portfolio.test.mjs` already contain unrelated dirty-worktree changes; implementation tasks must not commit or overwrite those baseline edits.

---

### Task 1: Define grouped sidebar navigation data

**Files:**
- Create: `src/data/sidebarMenu.js`
- Modify: `src/App.jsx`
- Test: `tests/portfolio.test.mjs`

**Interfaces:**
- Produces: `sidebarMenuGroups: Array<{ title: string, titleZh: string, link: string, ariaLabel: string, children: Array<{ label: string, link?: string, disabled?: boolean }> }>`.
- Produces: `sidebarStatusText: string` equal to `OPEN TO WORK · UI/UX · AI PRODUCT`.

- [ ] **Step 1: Write the failing data test**

Add a test that imports `sidebarMenuGroups` and asserts six group titles in order, exact routes for all active children, and a disabled AI Product item with no `link`.

- [ ] **Step 2: Run the data test and verify RED**

Run: `npm.cmd test`

Expected: FAIL because `src/data/sidebarMenu.js` does not exist.

- [ ] **Step 3: Implement the exact data contract**

Create the six groups `HOME`, `ABOUT`, `PROJECTS`, `PROCESS`, `LAB`, and `CONTACT`; use `/work/consumer`, `/work/enterprise`, `/work/campaign`, and `/#...` hashes from the approved design. Add `id="about-details"` to the existing About capability list in `App.jsx`.

- [ ] **Step 4: Run the data test and verify GREEN**

Run: `npm.cmd test`

Expected: the new data test and all existing tests pass.

- [ ] **Step 5: Review the scoped diff without committing**

Run: `git diff -- src/data/sidebarMenu.js src/App.jsx tests/portfolio.test.mjs`

Expected: only the menu data, About anchor, and test additions from this task; leave the dirty baseline uncommitted.

### Task 2: Build the accessible StaggeredMenu component

**Files:**
- Create: `src/components/StaggeredMenu.jsx`
- Create: `src/components/StaggeredMenu.css`
- Test: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: `groups`, `statusText`, `position`, `colors`, `panelColor`, `triggerTone`, and optional `onMenuOpen` / `onMenuClose` props.
- Produces: one inline three-line trigger button and one fixed overlay with staggered underlays plus an `aside` menu panel.

- [ ] **Step 1: Write the failing SSR contract test**

Render the component with one group and assert: `aria-expanded="false"`, `aria-controls="staggered-menu-panel"`, a bilingual group heading, an active child anchor, a disabled child span, status text, and the transparent bee asset path.

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm.cmd test`

Expected: FAIL because `StaggeredMenu.jsx` does not exist.

- [ ] **Step 3: Implement the React Bits animation lifecycle**

Adapt the supplied React Bits component so `position="left"` initializes panel and underlays at `xPercent: -100`. Use `gsap.context`, kill active timelines before reversal, stagger underlays by `0.07`, and stagger `.sm-menu-group` entries by `0.08`. Keep the trigger in document flow while the overlay is fixed.

- [ ] **Step 4: Implement close and accessibility behavior**

Add click-away and `Escape` listeners only while open, restore the previous `document.body.style.overflow` on close/unmount, focus the first group heading after opening, restore focus to the trigger after closing, close on active navigation clicks, and expose `aria-hidden` plus `inert` while closed.

- [ ] **Step 5: Implement the approved neutral styling**

Use the exact palette and width constraints from Global Constraints. Render group headings as links, children as smaller Chinese links, the AI item as a disabled `<span>`, and status text at the panel bottom.

- [ ] **Step 6: Implement the bee hover/focus treatment**

Render `<img src="/hero/design-in-bloom/bee.png" alt="" aria-hidden="true">` inside each group heading. Position it absolutely at the left, size with `clamp(32px, 3vw, 44px)`, start at `opacity: 0` and `translateX(-12px)`, and reveal it through `.sm-group-heading:hover` and `.sm-group-heading:focus-visible`. Do not attach this class to child links.

- [ ] **Step 7: Run tests and verify GREEN**

Run: `npm.cmd test`

Expected: all tests pass.

- [ ] **Step 8: Review the scoped diff without committing**

Run: `git diff -- src/components/StaggeredMenu.jsx src/components/StaggeredMenu.css tests/portfolio.test.mjs`

Expected: the new component, its CSS, and focused tests; leave the dirty baseline uncommitted.

### Task 3: Integrate the sidebar into every route

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/PillNav.css`
- Modify: `src/styles.css`
- Test: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: `StaggeredMenu`, `sidebarMenuGroups`, and `sidebarStatusText`.
- Produces: the same sidebar trigger and menu content on homepage, C-side, B-side, and campaign routes.

- [ ] **Step 1: Write the failing route integration test**

Render `/`, `/work/consumer`, `/work/enterprise`, and `/work/campaign`. For each route require one `staggered-menu-root`, six `.sm-menu-group` elements, the three completed project links, the disabled AI Product label, and no sidebar occurrence of `#b8ff68`.

- [ ] **Step 2: Run the route test and verify RED**

Run: `npm.cmd test`

Expected: FAIL because `Navigation` still renders `.studio-menu-mark` as a home anchor.

- [ ] **Step 3: Replace the top-left control**

Import the component and data in `App.jsx`. Replace the existing `.studio-menu-mark` anchor with `StaggeredMenu`; pass `triggerTone={inverted ? "light" : "dark"}`, `position="left"`, `colors={["#0B0B0B", "#454541", "#C8C6BF"]}`, and `panelColor="#F7F6F2"`.

- [ ] **Step 4: Preserve desktop navigation and remove mobile duplication**

Keep `PillNav` unchanged on desktop. At `max-width: 767px`, hide `.site-nav .pill-nav` including its internal mobile toggle and allow the wordmark to remain centered with StaggeredMenu at left.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm.cmd test`

Expected: all route and component tests pass.

- [ ] **Step 6: Review the scoped diff without committing**

Run: `git diff -- src/App.jsx src/components/PillNav.css src/styles.css tests/portfolio.test.mjs`

Expected: only sidebar integration and mobile navigation changes from this task; leave the dirty baseline uncommitted.

### Task 4: Production and browser verification

**Files:**
- Modify only if verification exposes a scoped sidebar defect.

**Interfaces:**
- Consumes: completed Tasks 1–3.
- Produces: verified desktop and mobile sidebar behavior.

- [ ] **Step 1: Run automated verification**

Run:

```powershell
npm.cmd test
npm.cmd run build
git diff --check
```

Expected: zero test failures, Vite build exit code 0, and no whitespace errors.

- [ ] **Step 2: Verify desktop interaction at 1440px**

Open the homepage locally, click the top-left trigger, and confirm: left underlays, warm-white panel, all groups and children visible, bee appears only on group heading hover, PillNav remains, outside click and Escape close the menu, and body scroll is locked only while open.

- [ ] **Step 3: Verify case-route contrast**

Open consumer and enterprise routes. Confirm the closed trigger is white against the dark fixed header, turns black over the open warm-white menu, and every menu link remains usable.

- [ ] **Step 4: Verify mobile at 390px**

Confirm the panel fills the viewport, content scrolls within the menu, PillNav mobile controls are hidden, the left trigger remains reachable, no horizontal overflow occurs, and the bee decoration does not obstruct touch targets.

- [ ] **Step 5: Record final status without deployment**

Report local URLs, automated results, and any visual limitation. Do not deploy or alter unrelated dirty-worktree files.
