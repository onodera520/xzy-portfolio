# Demo XZY React + Vite Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the vinext starter with a lightweight, PC-first React + Vite portfolio that remains performant on mobile.

**Architecture:** A Vite SPA renders the home page or one of three case pages from `window.location.pathname`. Content and decision logic remain framework-independent modules; React components consume them. One global stylesheet implements the 1700px layout, responsive media behavior, and reduced-motion fallbacks.

**Tech Stack:** React 19, Vite 8, JavaScript/JSX, native CSS, Node test runner

## Global Constraints

- Keep the local URL at `http://localhost:3000`.
- Maximum content width is `1700px` with a mobile breakpoint at `768px`.
- Do not fetch a Hero video on mobile, when data saver is active, or when no video URL is configured.
- Preserve the three existing project narratives and AI point of view without inventing outcomes.
- Remove vinext, Next.js, Cloudflare, database, Tailwind, and unused starter dependencies.

---

### Task 1: Failing behavior contract

**Files:**
- Replace: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: future `src/data/projects.js`, `src/lib/decision.js`, and `src/App.jsx`
- Produces: tests for project routes, interaction strategies, home landmarks, and case rendering

- [ ] Write Node tests that import the content and decision modules and SSR-load the React app through Vite.
- [ ] Run the test command and confirm it fails because the Vite source modules do not exist.

### Task 2: React content and interaction model

**Files:**
- Create: `src/data/projects.js`, `src/lib/decision.js`, `src/components/InteractionLab.jsx`, `src/components/ProjectCard.jsx`, `src/components/HeroMedia.jsx`

**Interfaces:**
- Produces: `projects`, `getProject`, `calculateDecision`, and reusable media, card, and lab components

- [ ] Port the three project narratives into plain JavaScript data.
- [ ] Implement the four deterministic decision strategies and accessible controls.
- [ ] Implement a desktop-only optional video loader with fallback state.

### Task 3: Page structure and responsive presentation

**Files:**
- Create: `index.html`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`, `.env.example`

**Interfaces:**
- Consumes: modules from Task 2
- Produces: homepage sections, three case routes, 1700px desktop shell, and mobile single-column fallbacks

- [ ] Build the Hero, navigation, introduction, work, interaction, AI, contact, and footer sections.
- [ ] Build the reusable case page and path selection.
- [ ] Add responsive CSS, focus states, reduced motion, and system-font styling.
- [ ] Run tests and confirm all behavior contracts pass.

### Task 4: Framework replacement and local handoff

**Files:**
- Replace: `package.json`, `package-lock.json`, `vite.config.js`
- Delete: vinext app, worker, database, examples, Next.js and Tailwind configuration files

**Interfaces:**
- Produces: `npm run dev`, `npm test`, and `npm run build`

- [ ] Stop the existing Demo XZY server and replace dependencies with React, React DOM, Vite, and the React Vite plugin only.
- [ ] Install and prune dependencies using a project-local temporary npm cache.
- [ ] Run the full tests and production build.
- [ ] Delete the npm cache and old generated outputs, recalculate folder size, then start `localhost:3000` and verify all routes.

