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
  assert.equal(getProject("enterprise").demo.url, "/portfolio/enterprise/demo/index.html");
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
  const campaign = projectGalleryItems.find((item) => item.slug === "campaign");
  assert.equal(campaign.image, "/portfolio/campaign/cover-frame-4.webp");
  assert.equal(campaign.status, "COMING SOON");
  assert.equal(campaign.link, undefined);
  assert.equal(campaign.alt, "骑福兽闹新春 H5 运营活动封面");
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

test("only the enterprise gallery cover anchors to the top center", async () => {
  const { projectGalleryItems } = await import("../src/data/projects.js");
  const { default: AccordionGallery } = await vite.ssrLoadModule(
    "/src/components/AccordionGallery.jsx",
  );
  const enterprise = projectGalleryItems.find((item) => item.slug === "enterprise");
  const otherItems = projectGalleryItems.filter((item) => item.slug !== "enterprise");

  assert.equal(enterprise.objectPosition, "center top");
  assert.equal(otherItems.every((item) => item.objectPosition === undefined), true);

  const html = renderToStaticMarkup(
    React.createElement(AccordionGallery, { items: projectGalleryItems }),
  );
  assert.equal((html.match(/object-position:center top/g) ?? []).length, 1);
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

test("homepage CTA scrolls the requested section into view", async () => {
  const { scrollToSection } = await vite.ssrLoadModule("/src/App.jsx");
  let receivedOptions;
  const section = {
    scrollIntoView(options) {
      receivedOptions = options;
    },
  };
  const documentRoot = {
    getElementById(id) {
      return id === "work" ? section : null;
    },
  };

  assert.equal(typeof scrollToSection, "function");
  assert.equal(scrollToSection("work", documentRoot), true);
  assert.deepEqual(receivedOptions, { behavior: "smooth", block: "start" });
  assert.equal(scrollToSection("missing", documentRoot), false);
});

test("home route renders the complete portfolio story", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(html, /把复杂问题/);
  assert.match(html, /设计成清晰体验/);
  assert.match(html, /ABOUT \/ ME/);
  assert.match(html, /Ziyi Xue/);
  assert.match(html, /求职方向：UI\/UX\/AI体验设计/);
  assert.match(html, /\/about\/ziyi-xue-cutout\.png/);
  assert.match(html, /我从研究和业务语境出发/);
  assert.match(html, /产品设计、UX 设计/);
  assert.match(html, /研究、定义、原型、验证/);
  assert.match(html, /开放求职机会/);
  assert.match(html, /RESEARCH[\s\S]*DESIGN[\s\S]*DELIVERY/);
  assert.doesNotMatch(html, /我是一名正在寻找产品设计与用户体验岗位/);
  assert.match(html, /精选作品/);
  assert.match(html, /设计决策实验室/);
  assert.match(html, /AI 与设计/);
  assert.match(html, /保持联系/);
  assert.match(html, /href="#work"/);
  assert.match(html, /href="#lab"/);
  assert.equal((html.match(/data-specular-button="true"/g) ?? []).length, 1);
  assert.match(html, /<button[^>]*data-specular-button="true"[^>]*>[\s\S]*查看作品[\s\S]*<\/button>/);
  assert.doesNotMatch(html, /class="button button-light" href="#work"/);
  assert.match(html, /data-faulty-terminal="true"/);
  assert.doesNotMatch(html, /data-hero-unicorn|unicornstudio/i);
  assert.doesNotMatch(html, /FULLSCREEN VIDEO PLACEHOLDER|<video/);
  assert.equal((html.match(/class="accordion-gallery/g) ?? []).length, 1);
  assert.equal((html.match(/class="ag-panel"/g) ?? []).length, 4);
  assert.equal((html.match(/ag-panel--active/g) ?? []).length, 0);
  assert.match(html, /\/portfolio\/consumer\/boards\/frame-01\.webp/);
  assert.match(html, /\/portfolio\/enterprise\/boards\/frame-01\.webp/);
  assert.match(html, /\/portfolio\/campaign\/cover-frame-4\.webp/);
  assert.doesNotMatch(html, /\/portfolio\/campaign\/cover\.webp/);
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

  assert.equal((html.match(/data-blur-text="true"/g) ?? []).length, 5);
  assert.match(html, /<h1[^>]*data-blur-text="true"/);
  assert.equal((html.match(/<h2[^>]*data-blur-text="true"/g) ?? []).length, 4);
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
  assert.match(enterpriseHtml, /<iframe[^>]+src="\/portfolio\/enterprise\/demo\/index\.html"/);
  assert.doesNotMatch(enterpriseHtml, /Demo 地址稍后补充/);
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

test("enterprise demo ships as a self-contained local static app", () => {
  const demoRoot = path.join(process.cwd(), "public", "portfolio", "enterprise", "demo");
  const indexPath = path.join(demoRoot, "index.html");
  const scriptPath = path.join(demoRoot, "assets", "index-B_Lv1ymR.js");
  const stylePath = path.join(demoRoot, "assets", "index-CfV49CKJ.css");

  for (const filePath of [indexPath, scriptPath, stylePath]) {
    assert.equal(fs.existsSync(filePath), true, `${filePath} should exist`);
  }

  const indexHtml = fs.readFileSync(indexPath, "utf8");
  const script = fs.readFileSync(scriptPath, "utf8");
  const style = fs.readFileSync(stylePath, "utf8");
  assert.match(indexHtml, /\/portfolio\/enterprise\/demo\/assets\/index-B_Lv1ymR\.js/);
  assert.match(script, /basename:"\/portfolio\/enterprise\/demo\/index\.html"/);
  assert.doesNotMatch(`${indexHtml}${script}${style}`, /(?:src=|href=|url\()\s*["']?\/assets\//);
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
  const headingIndex = linkedHtml.indexOf('class="demo-heading"');
  const linkIndex = linkedHtml.indexOf('href="https://demo.example.com"');
  const viewportIndex = linkedHtml.indexOf('class="demo-viewport is-live"');
  assert.ok(headingIndex < linkIndex && linkIndex < viewportIndex);
  assert.doesNotMatch(linkedHtml, /class="demo-footer"/);
  assert.doesNotMatch(emptyHtml, /class="demo-footer"/);
});

test("live enterprise demo renders inside a scalable fixed canvas", async () => {
  const { DemoEmbed } = await vite.ssrLoadModule("/src/components/DemoEmbed.jsx");
  const html = renderToStaticMarkup(
    React.createElement(DemoEmbed, {
      title: "跨境电商异常中枢平台",
      url: "/portfolio/enterprise/demo/index.html",
    }),
  );

  assert.match(html, /class="demo-canvas"/);
  assert.match(html, /width:1707px/);
  assert.match(html, /height:987px/);
  assert.doesNotMatch(html, /DESKTOP EXPERIENCE/);
});

test("complete artboards keep responsive breathing room between images", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(css, /--board-gap:\s*28px/);
  assert.match(css, /--board-gap:\s*14px/);
  assert.match(css, /\.case-reader-layout\s*\{[^}]*grid-template-columns:\s*clamp\(180px,\s*13vw,\s*220px\)\s+minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.portfolio-board-list\s*\{[^}]*width:\s*100%[^}]*gap:\s*var\(--board-gap\)/s);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*\.case-reader-layout\s*\{[^}]*grid-template-columns:\s*40px\s+minmax\(0,\s*1fr\)/);
});

test("the interactive demo wrapper gives the dashboard the full portfolio width", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");
  const wrapperRules = [...css.matchAll(/\.portfolio-board-demo\s*\{([^}]*)\}/g)]
    .map((match) => match[1]);

  assert.equal(wrapperRules.length, 2);
  for (const rule of wrapperRules) {
    assert.match(rule, /padding:\s*0/);
    assert.match(rule, /border-radius:\s*0/);
  }
  assert.match(wrapperRules[0], /border:\s*0/);
  assert.match(wrapperRules[0], /background:\s*transparent/);
  assert.match(css, /\.demo-heading\s*\{[^}]*margin-bottom:\s*16px/s);
  assert.match(css, /\.demo-heading h2\s*\{[^}]*font-size:\s*clamp\(24px,\s*2\.4vw,\s*32px\)/s);
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

test("PillNav renders four animated links and an accessible closed mobile menu", async () => {
  const { default: PillNav } = await vite.ssrLoadModule("/src/components/PillNav.jsx");
  const items = [
    { label: "作品", href: "#work" },
    { label: "关于", href: "#about" },
    { label: "互动实验", href: "#lab" },
    { label: "联系", href: "#contact" },
  ];
  const html = renderToStaticMarkup(React.createElement(PillNav, { items }));

  assert.equal((html.match(/class="pill"/g) ?? []).length, 4);
  assert.equal((html.match(/class="pill-label-hover" aria-hidden="true"/g) ?? []).length, 4);
  assert.match(html, /class="pill-nav-toggle"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="pill-nav-mobile-menu"/);
  assert.match(html, /id="pill-nav-mobile-menu"/);
});

test("PillNav keeps a navigation landmark without misreporting an anchor as the current page", async () => {
  const { default: PillNav } = await vite.ssrLoadModule("/src/components/PillNav.jsx");
  const html = renderToStaticMarkup(
    React.createElement(PillNav, {
      activeHref: "/#work",
      items: [
        { label: "作品", href: "/#work" },
        { label: "关于", href: "/#about" },
      ],
    }),
  );

  assert.match(html, /^<nav\b[^>]*aria-label="主导航"/);
  assert.match(html, /class="pill is-active"/);
  assert.doesNotMatch(html, /aria-current=/);
});

test("BorderGlow supports a neutral navigation container without changing card semantics", async () => {
  const { default: BorderGlow } = await vite.ssrLoadModule("/src/components/BorderGlow.jsx");
  const cardHtml = renderToStaticMarkup(
    React.createElement(BorderGlow, null, React.createElement("span", null, "Card")),
  );
  const navigationHtml = renderToStaticMarkup(
    React.createElement(BorderGlow, { as: "div" }, React.createElement("span", null, "Navigation")),
  );

  assert.match(cardHtml, /^<article\b/);
  assert.match(navigationHtml, /^<div\b/);
});

test("BorderGlow exposes a persistent breathing mode for the navigation frame", async () => {
  const { default: BorderGlow } = await vite.ssrLoadModule("/src/components/BorderGlow.jsx");
  const html = renderToStaticMarkup(
    React.createElement(
      BorderGlow,
      { as: "div", continuous: true },
      React.createElement("span", null, "Navigation"),
    ),
  );

  assert.match(html, /class="border-glow-card is-continuous"/);
  assert.match(html, /data-continuous-glow="true"/);
});

test("PillNav can remove the shared desktop shell without removing animated pills", async () => {
  const { default: PillNav } = await vite.ssrLoadModule("/src/components/PillNav.jsx");
  const html = renderToStaticMarkup(
    React.createElement(PillNav, {
      frameless: true,
      items: [
        { label: "Work", href: "#work" },
        { label: "About", href: "#about" },
      ],
    }),
  );

  assert.match(html, /class="pill-nav pill-nav--frameless"/);
  assert.equal((html.match(/class="pill-hover-circle"/g) ?? []).length, 2);
});

test("BorderGlow intro animation exposes cleanup for pending timer work", async () => {
  const { animateValue } = await vite.ssrLoadModule("/src/components/BorderGlow.jsx");
  const calls = [];
  const scheduler = {
    now: () => 0,
    setTimeout: () => 41,
    clearTimeout: (id) => calls.push(["timeout", id]),
    requestAnimationFrame: () => 42,
    cancelAnimationFrame: (id) => calls.push(["frame", id]),
  };

  const cancel = animateValue({ delay: 1000, onUpdate() {} }, scheduler);
  assert.equal(typeof cancel, "function");
  cancel();
  assert.deepEqual(calls, [["timeout", 41]]);
});

test("every public route uses one glowing PillNav while preserving its anchor destinations", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const homeHtml = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.equal((homeHtml.match(/class="border-glow-card is-continuous site-nav-glow"/g) ?? []).length, 1);
  assert.equal((homeHtml.match(/class="wordmark"/g) ?? []).length, 1);
  assert.equal((homeHtml.match(/class="pill"/g) ?? []).length, 4);
  for (const href of ["#work", "#about", "#lab", "#contact"]) {
    assert.match(homeHtml, new RegExp(`href="${href}"`));
  }

  for (const route of ["/work/consumer", "/work/enterprise", "/work/campaign"]) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: route }));
    assert.equal((html.match(/class="border-glow-card is-continuous site-nav-glow"/g) ?? []).length, 1, route);
    assert.equal((html.match(/class="pill(?: is-active)?"/g) ?? []).length, 4, route);
    assert.match(html, /href="\/#work"/);
    assert.match(html, /href="\/#about"/);
    assert.match(html, /href="\/#lab"/);
    assert.match(html, /href="\/#contact"/);
    assert.match(html, /class="pill is-active"/);
  }
});

test("the ProfileCard portrait is a local PNG with transparency", () => {
  const portraitPath = path.join(process.cwd(), "public", "about", "ziyi-xue-cutout.png");
  assert.equal(fs.existsSync(portraitPath), true);

  const bytes = fs.readFileSync(portraitPath);
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(bytes.readUInt32BE(16), 1024);
  assert.equal(bytes.readUInt32BE(20), 1536);
  assert.ok([4, 6].includes(bytes[25]), "portrait PNG must include an alpha channel");
});

test("ProfileCard renders only the portrait identity and role", async () => {
  const { default: ProfileCard } = await vite.ssrLoadModule("/src/components/ProfileCard.jsx");
  const html = renderToStaticMarkup(
    React.createElement(ProfileCard, {
      avatarUrl: "/about/ziyi-xue-cutout.png",
      name: "Ziyi Xue",
      title: "求职方向：UI/UX/AI体验设计",
    }),
  );

  assert.match(html, /class="pc-card-wrapper"/);
  assert.match(html, /src="\/about\/ziyi-xue-cutout\.png"/);
  assert.match(html, /Ziyi Xue/);
  assert.match(html, /求职方向：UI\/UX\/AI体验设计/);
  assert.doesNotMatch(html, /pc-user-info|pc-mini-avatar|pc-contact-btn|@javicodes|Online/);
});

test("ProfileCard limits tilt to fine hover pointers and cleans up cancelled gestures", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "ProfileCard.jsx"),
    "utf8",
  );

  assert.match(source, /matchMedia\("\(hover: hover\) and \(pointer: fine\)"\)/);
  assert.match(source, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(source, /addEventListener\("pointercancel", handlePointerLeave\)/);
  assert.match(source, /removeEventListener\("pointercancel", handlePointerLeave\)/);
});
