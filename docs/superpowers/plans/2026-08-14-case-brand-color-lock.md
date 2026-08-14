# 作品详情页品牌颜色锁定实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让所有作品详情页左上菜单按钮与“XUE STUDIO”在滚动期间始终保持黑色，同时保留首页动态明暗适配。

**Architecture:** 在现有品牌对比度数据流中加入可选固定值：检测逻辑仍产生 `detectedContrast`，`resolveBrandContrast` 在作品详情页有固定值时优先返回固定值，否则返回检测值。详情页通过导航参数选择固定 `light` 模式，首页保持 adaptive 模式。

**Tech Stack:** React 19、JavaScript、Node.js 内置测试运行器、Vite 8

## Global Constraints

- 仅 C 端、B 端和 H5 等使用 `.board-case` 的作品详情页固定品牌颜色。
- 固定范围只有菜单触发按钮和“XUE STUDIO”文字。
- 首页及其他非作品详情页继续保留现有明暗对比度自适应行为。
- 不修改中间导航胶囊、右侧图标、章节导航、作品图片、滚动动画或菜单交互。
- 不新增依赖。

---

### Task 1: 增加可测试的固定对比度解析

**Files:**
- Modify: `tests/brand-contrast.test.mjs`
- Modify: `src/lib/brandContrast.js`

**Interfaces:**
- Consumes: `detectedTheme: "light" | "dark"`、可选 `fixedTheme: "light" | "dark" | undefined`。
- Produces: `resolveBrandContrast(detectedTheme, fixedTheme): "light" | "dark"`。

- [x] **Step 1: 写入失败测试**

```js
test("fixed brand contrast overrides detection without changing adaptive pages", () => {
  assert.equal(resolveBrandContrast("dark", "light"), "light");
  assert.equal(resolveBrandContrast("dark"), "dark");
});
```

- [x] **Step 2: 运行测试并确认因缺少导出而失败**

Run: `node --test --test-name-pattern="fixed brand contrast" tests/brand-contrast.test.mjs`

Expected: FAIL，提示 `resolveBrandContrast` 未导出。

- [x] **Step 3: 实现最小解析函数**

```js
export function resolveBrandContrast(detectedTheme, fixedTheme) {
  return fixedTheme === undefined
    ? normalizeBrandContrast(detectedTheme)
    : normalizeBrandContrast(fixedTheme, detectedTheme);
}
```

- [x] **Step 4: 运行聚焦测试并确认通过**

Run: `node --test --test-name-pattern="fixed brand contrast" tests/brand-contrast.test.mjs`

Expected: PASS，1 个测试通过，0 个失败。

### Task 2: 只在作品详情页启用固定模式

**Files:**
- Modify: `tests/portfolio.test.mjs`
- Modify: `src/App.jsx`
- Modify: `src/components/FigmaCaseStudy.jsx`

**Interfaces:**
- Consumes: `Navigation({ fixedBrandContrast?: "light" | "dark" })`、`resolveBrandContrast`。
- Produces: 详情页导航 `data-brand-contrast="light" data-brand-contrast-mode="fixed"`；首页导航 `data-brand-contrast-mode="adaptive"`。

- [x] **Step 1: 写入失败的路由行为测试**

```js
test("case pages lock the brand dark while the homepage stays adaptive", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const homeHtml = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(homeHtml, /<header[^>]*data-brand-contrast="light"[^>]*data-brand-contrast-mode="adaptive"/);
  for (const slug of ["consumer", "enterprise", "campaign"]) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: `/work/${slug}` }));
    assert.match(html, /<header[^>]*data-brand-contrast="light"[^>]*data-brand-contrast-mode="fixed"/, slug);
  }
});
```

- [x] **Step 2: 运行测试并确认因缺少模式属性而失败**

Run: `node --test --test-name-pattern="case pages lock the brand dark" tests/portfolio.test.mjs`

Expected: FAIL，渲染的 header 不含 `data-brand-contrast-mode`。

- [x] **Step 3: 接入固定参数**

在 `Navigation` 中分别保留检测值与最终值：

```jsx
const detectedBrandContrast = useBrandContrast({ defaultTheme: "light" });
const brandContrast = resolveBrandContrast(detectedBrandContrast, fixedBrandContrast);
```

在 header 上增加：

```jsx
data-brand-contrast-mode={fixedBrandContrast === undefined ? "adaptive" : "fixed"}
```

作品详情页调用：

```jsx
<Navigation inverted fixedBrandContrast="light" />
```

- [x] **Step 4: 运行聚焦测试并确认通过**

Run: `node --test --test-name-pattern="case pages lock the brand dark" tests/portfolio.test.mjs`

Expected: PASS，1 个测试通过，0 个失败。

- [x] **Step 5: 运行完整回归与构建**

Run: `npm.cmd test`

Expected: 所有测试通过，0 个失败。

Run: `npm.cmd run build`

Expected: Vite 构建退出码为 0；允许现有的大于 500 kB 分包提示，但不得新增构建错误。

- [x] **Step 6: 检查差异并提交**

Run: `git diff --check`

Expected: 退出码为 0，没有空白字符错误。

```bash
git add docs/superpowers/specs/2026-08-14-case-brand-color-lock-design.md docs/superpowers/plans/2026-08-14-case-brand-color-lock.md src/lib/brandContrast.js src/App.jsx src/components/FigmaCaseStudy.jsx tests/brand-contrast.test.mjs tests/portfolio.test.mjs
git commit -m "fix: keep case brand controls dark"
```
