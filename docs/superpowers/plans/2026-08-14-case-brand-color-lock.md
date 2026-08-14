# 作品详情页品牌颜色锁定实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让所有作品详情页左上菜单按钮与“XUE STUDIO”在滚动期间始终保持黑色。

**Architecture:** 保留现有 `useBrandContrast` 动态检测，让首页继续根据背景明暗切换品牌色；仅在 `.board-case` 作用域内覆盖 `--brand-contrast-color`。使用一个样式回归测试同时锁定普通状态和 `data-brand-contrast="dark"` 状态。

**Tech Stack:** React 19、CSS、Node.js 内置测试运行器、Vite 8

## Global Constraints

- 适用于 C 端、B 端和 H5 等所有使用 `.board-case` 容器的作品详情页。
- 只固定左上 `.nav-brand` 区域，包括菜单触发按钮和“XUE STUDIO”文字。
- 首页及其他非作品详情页继续保留现有的明暗对比度自适应行为。
- 不修改中间导航胶囊、右侧图标、章节导航、作品图片、滚动动画或菜单交互。
- 不新增依赖。

---

### Task 1: 锁定作品详情页品牌颜色

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `.board-case` 详情页容器、`.site-nav[data-brand-contrast]` 动态状态、`.nav-brand` 的 `--brand-contrast-color` 变量。
- Produces: 作品详情页专属颜色覆盖；不新增 JavaScript 接口。

- [ ] **Step 1: 写入失败的样式回归测试**

在 `tests/portfolio.test.mjs` 增加：

```js
test("portfolio detail brand stays ink-colored across adaptive contrast states", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(
    css,
    /\.board-case \.nav-brand,\s*\.board-case \.site-nav\[data-brand-contrast="dark"\] \.nav-brand\s*\{[^}]*--brand-contrast-color:\s*var\(--bloom-ink\)/s,
  );
});
```

- [ ] **Step 2: 运行聚焦测试并确认失败**

Run: `node --test --test-name-pattern="portfolio detail brand stays ink-colored" tests/portfolio.test.mjs`

Expected: FAIL，提示 `src/styles.css` 不匹配作品详情页颜色覆盖正则。

- [ ] **Step 3: 加入最小样式覆盖**

在 `src/styles.css` 现有 `.board-case .site-nav-solid` 规则附近加入：

```css
.board-case .nav-brand,
.board-case .site-nav[data-brand-contrast="dark"] .nav-brand {
  --brand-contrast-color: var(--bloom-ink);
}
```

- [ ] **Step 4: 运行聚焦测试并确认通过**

Run: `node --test --test-name-pattern="portfolio detail brand stays ink-colored" tests/portfolio.test.mjs`

Expected: PASS，1 个测试通过，0 个失败。

- [ ] **Step 5: 运行完整回归与构建**

Run: `npm.cmd test`

Expected: 所有测试通过，0 个失败。

Run: `npm.cmd run build`

Expected: Vite 构建退出码为 0；允许现有的大于 500 kB 分包提示，但不得新增构建错误。

- [ ] **Step 6: 检查差异并提交**

Run: `git diff --check`

Expected: 退出码为 0，没有空白字符错误。

```bash
git add src/styles.css tests/portfolio.test.mjs
git commit -m "fix: keep case brand controls dark"
```
