# Demo XZY Public Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the validated Demo XZY portfolio at a public URL and reduce the local folder to regenerable source files.

**Architecture:** Deploy the existing vinext build through Sites without changing page behavior. Persist the returned hosting project identifier, save one validated version, deploy it publicly, verify the resulting URL, then remove only generated local dependencies, caches, and build outputs.

**Tech Stack:** vinext, Sites hosting, Git, npm

## Global Constraints

- Public access is explicitly approved by the user.
- The deployed source must match the last successful six-route test run.
- Cleanup occurs only after deployment reports success and the public URL responds.
- Source, content, tests, hosting metadata, and package lock files must remain.

---

### Task 1: Validate and publish

**Files:**
- Modify: `.openai/hosting.json`
- Package: generated deployment archive outside tracked source

**Interfaces:**
- Consumes: `dist/server/index.js`, built assets, and `.openai/hosting.json`
- Produces: one public deployment URL and persisted `project_id`

- [ ] Run `npm test` and require six passing route tests.
- [ ] Create or reuse the Sites project and persist only its `project_id` plus existing logical bindings.
- [ ] Commit the exact validated source, package the build with the Sites helper, and save one version.
- [ ] Deploy with the approved public access level and poll until success.
- [ ] Open the returned public URL and confirm it responds.

### Task 2: Remove regenerable local files

**Files:**
- Delete: `node_modules`, `.npm-cache`, `dist`, `.vinext`, `.wrangler`
- Preserve: `app`, `public`, `tests`, `docs`, `.openai`, `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: successful public deployment from Task 1
- Produces: lightweight local source directory that can be restored with `npm install`

- [ ] Stop only the development server process belonging to Demo XZY.
- [ ] Resolve and verify every cleanup target is inside the Demo XZY directory.
- [ ] Remove the five explicit generated directories.
- [ ] Recalculate directory size and confirm source and package manifests remain.

