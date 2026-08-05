import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, before, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

let vite;

before(async () => {
  vite = await createServer({
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [react()],
    server: { middlewareMode: true },
  });
});

after(async () => {
  await vite?.close();
});

test("project collection resolves each public case route", async () => {
  const { getProject, projects } = await import("../src/data/projects.js");

  assert.equal(projects.length, 3);
  assert.equal(getProject("consumer").title, "AI健康管家一站式服务平台");
  assert.equal(getProject("consumer").frames.length, 15);
  assert.equal(getProject("consumer").frames.filter((frame) => frame.board).length, 15);
  assert.equal(new Set(getProject("consumer").frames.map((frame) => frame.nodeId)).size, 15);
  assert.equal(getProject("enterprise").title, "跨境电商异常中枢平台");
  assert.equal(getProject("enterprise").frames.length, 14);
  assert.equal(getProject("enterprise").frames.filter((frame) => frame.board).length, 14);
  assert.equal(new Set(getProject("enterprise").frames.map((frame) => frame.nodeId)).size, 14);
  assert.equal(getProject("enterprise").demo.url, "");
  assert.equal(getProject("campaign").title, "H5 运营活动项目");
  assert.equal(getProject("missing"), undefined);

  assert.deepEqual(
    getProject("consumer").frames.map((frame) => frame.nodeId),
    ["808:9358", "808:2901", "808:2951", "808:3529", "808:4310", "808:4369", "808:4492", "808:8597", "808:8847", "808:4514", "808:7911", "808:7679", "808:5571", "808:6634", "808:7849"],
  );
  assert.deepEqual(
    getProject("enterprise").frames.map((frame) => frame.nodeId),
    ["808:9910", "808:9807", "808:9756", "808:9992", "808:10222", "808:10273", "808:10585", "808:10752", "808:11152", "808:11240", "808:12509", "808:12606", "808:11922", "808:12759"],
  );
  assert.deepEqual(
    getProject("consumer").frames.map((frame) => frame.title),
    ["项目封面", "产品概览", "现状与用户", "AI 调研流程", "需求洞察", "体验路径", "设计规范", "首页", "问诊与档案", "AI 对话", "辅助购药", "活动与个人中心", "商品与结算", "用药回访", "项目总结"],
  );
  assert.deepEqual(
    getProject("enterprise").frames.map((frame) => frame.title),
    ["项目封面与背景", "AI 调研", "机会点", "视觉规范", "栅格系统", "组件库", "异常看板", "任务列表", "进度验收", "高风险订单", "库存决策", "数据复盘", "多角色走查", "Vibe Coding 与 AI 反思"],
  );
});

test("every complete artboard is local and parseable", async () => {
  const { projects } = await import("../src/data/projects.js");
  const importedProjects = projects.filter((project) => project.frames);
  const assets = importedProjects.flatMap((project) => project.frames.map((frame) => frame.board));

  for (const item of assets) {
    assert.ok(item, "every imported frame should declare a complete board asset");
    for (const publicPath of [item.src, item.mobile].filter(Boolean)) {
      assert.match(publicPath, /^\/portfolio\/(consumer|enterprise)\//);
      assert.doesNotMatch(publicPath, /figma\.com|https?:\/\//);
      const filePath = path.join(process.cwd(), "public", ...publicPath.split("/").filter(Boolean));
      assert.equal(fs.existsSync(filePath), true, `${publicPath} should exist`);
      const bytes = fs.readFileSync(filePath);
      if (publicPath.endsWith(".webp")) {
        assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
        assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP");
      } else {
        assert.match(bytes.toString("utf8", 0, 500), /<svg\b/);
      }
    }
  }
});

test("home gallery data contains two live cases and two local placeholders", async () => {
  const {
    homeMarqueeRows,
    homeSectionIds,
    projectGalleryItems,
    projects,
  } = await import("../src/data/projects.js");

  assert.equal(projects.length, 3);
  assert.deepEqual(
    projectGalleryItems.map((item) => item.slug),
    ["consumer", "enterprise", "campaign", "ai-product"],
  );
  assert.deepEqual(
    projectGalleryItems.map((item) => item.link ?? null),
    ["/work/consumer", "/work/enterprise", null, null],
  );
  assert.equal(projectGalleryItems.filter((item) => item.status === "COMING SOON").length, 2);
  for (const item of projectGalleryItems) {
    assert.match(item.image, /^\/portfolio\//);
    assert.doesNotMatch(item.image, /^https?:\/\//);
    const filePath = path.join(process.cwd(), "public", ...item.image.split("/").filter(Boolean));
    assert.equal(fs.existsSync(filePath), true, `${item.image} should exist`);
  }

  assert.deepEqual(homeSectionIds, ["top", "about", "work", "lab", "contact"]);
  assert.equal(homeMarqueeRows.length, 2);
  assert.equal(homeMarqueeRows.every((row) => row.trim().length > 0), true);
});

test("decision lab favors user value when it clearly leads", async () => {
  const { calculateDecision } = await import("../src/lib/decision.js");
  const result = calculateDecision({ user: 90, business: 48, effort: 35 });

  assert.equal(result.key, "user-first");
  assert.match(result.title, /用户/);
});

test("decision lab reduces scope when effort dominates", async () => {
  const { calculateDecision } = await import("../src/lib/decision.js");
  const result = calculateDecision({ user: 54, business: 56, effort: 92 });

  assert.equal(result.key, "reduce-scope");
  assert.match(result.title, /范围/);
});

test("decision lab identifies a balanced direction", async () => {
  const { calculateDecision } = await import("../src/lib/decision.js");
  const result = calculateDecision({ user: 76, business: 72, effort: 42 });

  assert.equal(result.key, "balanced");
  assert.match(result.title, /平衡/);
});

test("home route renders the complete portfolio story", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(html, /把复杂问题/);
  assert.match(html, /设计成清晰体验/);
  assert.match(html, /我是一名正在寻找产品设计与用户体验岗位/);
  assert.match(html, /精选作品/);
  assert.match(html, /设计决策实验室/);
  assert.match(html, /AI 与设计/);
  assert.match(html, /保持联系/);
  assert.match(html, /href="#work"/);
  assert.match(html, /href="#lab"/);
  assert.match(html, /data-faulty-terminal="true"/);
  assert.doesNotMatch(html, /data-hero-unicorn|unicornstudio/i);
  assert.doesNotMatch(html, /FULLSCREEN VIDEO PLACEHOLDER|<video/);
  assert.equal((html.match(/class="accordion-gallery/g) ?? []).length, 1);
  assert.equal((html.match(/class="ag-panel"/g) ?? []).length, 4);
  assert.equal((html.match(/ag-panel--active/g) ?? []).length, 0);
  assert.match(html, /\/portfolio\/consumer\/boards\/frame-01\.webp/);
  assert.match(html, /\/portfolio\/enterprise\/boards\/frame-01\.webp/);
  assert.match(html, /\/portfolio\/placeholders\/h5\.svg/);
  assert.match(html, /\/portfolio\/placeholders\/ai-product\.svg/);
  assert.doesNotMatch(html, /class="project-card/);
});

test("homepage preserves SoftAurora and moves FaultyTerminal into the AI section", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
  );

  assert.equal((html.match(/class="soft-aurora-container"/g) ?? []).length, 1);
  assert.match(html, /class="hero-aurora"[^>]*aria-hidden="true"/);
  assert.equal((html.match(/data-faulty-terminal="true"/g) ?? []).length, 1);
  assert.match(html, /class="ai-terminal-card"[\s\S]*data-faulty-terminal="true"/);
  assert.doesNotMatch(html, /data-hero-unicorn|unicornstudio/i);
  assert.equal(packageJson.dependencies["unicornstudio-react"], undefined);
  assert.equal((html.match(/class="accordion-gallery/g) ?? []).length, 1);
});

test("home headings use a semantic one-time blur reveal", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.equal((html.match(/data-blur-text="true"/g) ?? []).length, 6);
  assert.match(html, /<h1[^>]*data-blur-text="true"/);
  assert.equal((html.match(/<h2[^>]*data-blur-text="true"/g) ?? []).length, 5);
  assert.match(html, /class="fade-content home-reveal"/);
});

test("BlurText does not clip its animated glyphs at the line box", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(css, /\.blur-text\s*\{[^}]*overflow:\s*visible/s);
  assert.doesNotMatch(css, /\.blur-text\s*\{[^}]*overflow:\s*hidden/s);
});

test("the Morez-inspired hero and AI terminal keep distinct visual layers", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(html, /class="hero-aurora"/);
  assert.match(html, /class="hero-content shell"/);
  assert.match(html, /class="ai-terminal-card"/);
  assert.match(html, /data-faulty-terminal="true"/);
  assert.ok(html.indexOf('class="hero-aurora"') < html.indexOf('class="hero-content shell"'));
  assert.ok(html.indexOf('class="ai-terminal-card"') < html.indexOf('data-faulty-terminal="true"'));
});

test("accordion gallery declares complete 1920 by 1080 cover dimensions", async () => {
  const { default: AccordionGallery } = await vite.ssrLoadModule("/src/components/AccordionGallery.jsx");
  const html = renderToStaticMarkup(React.createElement(AccordionGallery, {
    items: [
      { label: "C 端产品", status: "案例一", image: "/cover-one.webp", link: "/work/consumer" },
      { label: "B 端产品", status: "案例二", image: "/cover-two.webp", link: "/work/enterprise" },
    ],
  }));

  assert.equal((html.match(/width="1920"/g) ?? []).length, 2);
  assert.equal((html.match(/height="1080"/g) ?? []).length, 2);
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 2);
  assert.equal((html.match(/decoding="async"/g) ?? []).length, 2);
});

test("Figma-backed case routes render only complete artboards in source order", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const enterpriseHtml = renderToStaticMarkup(
    React.createElement(App, { initialPath: "/work/enterprise" }),
  );
  const consumerHtml = renderToStaticMarkup(
    React.createElement(App, { initialPath: "/work/consumer" }),
  );

  assert.match(consumerHtml, /AI健康管家一站式服务平台/);
  assert.equal((consumerHtml.match(/class="portfolio-board"/g) ?? []).length, 15);
  assert.equal((consumerHtml.match(/data-figma-node=/g) ?? []).length, 15);
  assert.equal((consumerHtml.match(/class="portfolio-board-entry"/g) ?? []).length, 15);
  assert.equal((consumerHtml.match(/class="line-sidebar__item"/g) ?? []).length, 15);
  assert.match(consumerHtml, /id="case-frame-consumer-1"/);
  assert.match(enterpriseHtml, /跨境电商异常中枢平台/);
  assert.match(enterpriseHtml, /可交互 Demo/);
  assert.match(enterpriseHtml, /Demo 地址稍后补充/);
  assert.equal((enterpriseHtml.match(/class="portfolio-board"/g) ?? []).length, 14);
  assert.equal((enterpriseHtml.match(/data-figma-node=/g) ?? []).length, 14);
  assert.equal((enterpriseHtml.match(/class="portfolio-board-entry"/g) ?? []).length, 14);
  assert.equal((enterpriseHtml.match(/class="line-sidebar__item"/g) ?? []).length, 14);
  assert.match(enterpriseHtml, /id="case-frame-enterprise-14"/);
  assert.doesNotMatch(`${consumerHtml}${enterpriseHtml}`, /scroll-stack-/);
  assert.doesNotMatch(`${consumerHtml}${enterpriseHtml}`, /figma-frame-copy|figma-metrics|figma-journey/);
  assert.ok(enterpriseHtml.indexOf('data-figma-node="808:9910"') < enterpriseHtml.indexOf('class="demo-embed'));
  assert.ok(enterpriseHtml.indexOf('class="demo-embed') < enterpriseHtml.indexOf('data-figma-node="808:9807"'));
  assert.ok(
    enterpriseHtml.indexOf('data-figma-node="808:12759"') <
      enterpriseHtml.indexOf('class="case-other-link'),
  );
  assert.doesNotMatch(`${consumerHtml}${enterpriseHtml}`, /2830008192@qq\.com|2026我能找到工作吗|我是文案|figma\.com\/api\/mcp\/asset/);
});

test("DemoEmbed reserves space before a URL and exposes both embed and fallback after one is provided", async () => {
  const { DemoEmbed } = await vite.ssrLoadModule("/src/components/DemoEmbed.jsx");
  const emptyHtml = renderToStaticMarkup(
    React.createElement(DemoEmbed, { title: "异常中枢交互 Demo", url: "" }),
  );
  const linkedHtml = renderToStaticMarkup(
    React.createElement(DemoEmbed, {
      title: "异常中枢交互 Demo",
      url: "https://demo.example.com",
    }),
  );

  assert.match(emptyHtml, /Demo 地址稍后补充/);
  assert.doesNotMatch(emptyHtml, /<iframe/);
  assert.match(linkedHtml, /<iframe/);
  assert.match(linkedHtml, /https:\/\/demo\.example\.com/);
  assert.match(linkedHtml, /在新窗口打开/);
});

test("complete artboards keep responsive breathing room between images", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(css, /--board-gap:\s*28px/);
  assert.match(css, /--board-gap:\s*14px/);
  assert.match(css, /\.case-reader-layout\s*\{[^}]*grid-template-columns:\s*clamp\(180px,\s*13vw,\s*220px\)\s+minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.portfolio-board-list\s*\{[^}]*width:\s*100%[^}]*gap:\s*var\(--board-gap\)/s);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*\.case-reader-layout\s*\{[^}]*grid-template-columns:\s*40px\s+minmax\(0,\s*1fr\)/);
});

test("every complete artboard has a 16px rounded corner", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(css, /\.portfolio-board\s*\{[^}]*border-radius:\s*16px/s);
});

test("ScrollFloat splits the other-cases label into animated characters", async () => {
  const { default: ScrollFloat } = await vite.ssrLoadModule("/src/components/ScrollFloat.jsx");
  const html = renderToStaticMarkup(
    React.createElement(ScrollFloat, null, "查看其他案例"),
  );

  assert.equal((html.match(/class="char"/g) ?? []).length, 6);
  assert.match(html, /查<\/span><span class="char">看/);
  assert.match(html, /案<\/span><span class="char">例/);
});

test("every project route ends with the shared animated other-cases link", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");

  for (const route of ["/work/consumer", "/work/enterprise", "/work/campaign"]) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: route }));

    assert.equal((html.match(/class="case-other-link"/g) ?? []).length, 1, route);
    assert.match(html, /href="\/#work"/);
    assert.equal((html.match(/class="char"/g) ?? []).length, 6, route);
    assert.match(html, /查看其他案例/);
  }
});

test("the other-cases footer always runs the full ScrollFloat effect", () => {
  const pageCss = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");
  const animationCss = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "ScrollFloat.css"),
    "utf8",
  );
  const animationSource = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "ScrollFloat.jsx"),
    "utf8",
  );
  const footerSource = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "CaseOtherLink.jsx"),
    "utf8",
  );

  assert.match(pageCss, /\.case-other-link\s+a\s*\{[^}]*color:\s*#000/s);
  assert.match(pageCss, /font-size:\s*clamp\(36px,\s*4vw,\s*56px\)/);
  assert.match(pageCss, /font-size:\s*clamp\(28px,\s*8vw,\s*36px\)/);
  assert.match(pageCss, /font-weight:\s*900/);
  assert.doesNotMatch(animationSource, /prefers-reduced-motion/);
  assert.doesNotMatch(animationCss, /prefers-reduced-motion|transform:\s*none\s*!important/);
  assert.match(footerSource, /scrollStart="top bottom"/);
  assert.match(footerSource, /scrollEnd="bottom bottom"/);
});

test("AccordionGallery starts with four equal, inactive project panels", async () => {
  const { default: AccordionGallery } = await vite.ssrLoadModule(
    "/src/components/AccordionGallery.jsx",
  );
  const items = [
    { image: "/c.webp", label: "C 端", link: "/work/consumer" },
    { image: "/b.webp", label: "B 端", link: "/work/enterprise" },
    { image: "/h5.svg", label: "H5", status: "COMING SOON" },
    { image: "/ai.svg", label: "AI 产品", status: "COMING SOON" },
  ];
  const html = renderToStaticMarkup(React.createElement(AccordionGallery, { items }));

  assert.equal((html.match(/class="ag-panel"/g) ?? []).length, 4);
  assert.equal((html.match(/ag-panel--active/g) ?? []).length, 0);
  assert.equal((html.match(/<a class="ag-panel"/g) ?? []).length, 2);
  assert.equal((html.match(/<button[^>]*class="ag-panel"/g) ?? []).length, 2);
  assert.equal((html.match(/class="ag-panel__status">COMING SOON/g) ?? []).length, 2);
});

test("project accordion keeps responsive space on both sides", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(
    css,
    /\.project-gallery-shell\s*\{[^}]*width:\s*min\(calc\(100%\s*-\s*clamp\(48px,\s*7vw,\s*132px\)\),\s*1700px\)/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*520px\)[\s\S]*\.project-gallery-shell\s*\{[^}]*width:\s*calc\(100%\s*-\s*32px\)/,
  );
});

test("LineSidebar renders chapter buttons with a controlled active item", async () => {
  const { default: LineSidebar } = await vite.ssrLoadModule(
    "/src/components/LineSidebar.jsx",
  );
  const html = renderToStaticMarkup(
    React.createElement(LineSidebar, {
      items: ["封面", "研究", "方案"],
      activeIndex: 1,
    }),
  );

  assert.equal((html.match(/class="line-sidebar__button"/g) ?? []).length, 3);
  assert.equal((html.match(/aria-current="true"/g) ?? []).length, 1);
  assert.match(html, /<button[^>]*type="button"/);
});

test("case chapter navigation uses scroll on mobile and scroll hover or focus on desktop", async () => {
  const { shouldShowChapterNav, getCaseFrameId } = await vite.ssrLoadModule(
    "/src/components/CaseChapterNav.jsx",
  );

  assert.equal(
    shouldShowChapterNav({ isMobile: true, isScrolling: true, isHovered: false, isFocused: false }),
    true,
  );
  assert.equal(
    shouldShowChapterNav({ isMobile: true, isScrolling: false, isHovered: true, isFocused: true }),
    false,
  );
  assert.equal(
    shouldShowChapterNav({ isMobile: false, isScrolling: false, isHovered: true, isFocused: false }),
    true,
  );
  assert.equal(
    shouldShowChapterNav({ isMobile: false, isScrolling: false, isHovered: false, isFocused: true }),
    true,
  );
  assert.equal(
    shouldShowChapterNav({ isMobile: false, isScrolling: false, isHovered: false, isFocused: false }),
    false,
  );
  assert.equal(getCaseFrameId("consumer", 0), "case-frame-consumer-1");
});
