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

test("bouquet mouse clicks do not retain a focus frame", async () => {
  const { shouldSuppressFlowerPointerFocus } = await import("../src/lib/flowerPhysics.js");

  assert.equal(shouldSuppressFlowerPointerFocus("mouse"), true);
  assert.equal(shouldSuppressFlowerPointerFocus("touch"), false);
  assert.equal(shouldSuppressFlowerPointerFocus(""), false);
});

test("the bouquet carries its poke hint without changing the hero flow", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  const css = fs.readFileSync(path.join(process.cwd(), "src", "components", "BeeSwarmHero.css"), "utf8");

  assert.match(html, /class="bee-swarm__flower-motion"/);
  assert.match(html, /class="bee-swarm__flower-hint"[^>]*>戳我试试↑<\/span>/);
  assert.match(css, /\.bee-swarm__flower-motion\s*\{[^}]*position:\s*absolute/s);
  assert.match(css, /\.bee-swarm__flower-hint\s*\{[^}]*position:\s*absolute/s);
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
  assert.equal(getProject("campaign").title, "骑福兽，闹新春");
  assert.equal(getProject("campaign").tone, "campaign");
  assert.equal(getProject("campaign").frames.length, 5);
  assert.equal(getProject("campaign").demo, null);
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
  assert.deepEqual(
    getProject("campaign").frames.map((frame) => frame.nodeId),
    ["campaign:01", "campaign:02", "campaign:03", "campaign:04", "campaign:05"],
  );
  assert.deepEqual(
    getProject("campaign").frames.map((frame) => frame.title),
    ["项目封面", "AI 工作流设计", "主视觉运营设计", "徽章收集体验", "AIGC 经验总结"],
  );
});

test("portfolio frames declare the preset contrast needed by the fixed brand", async () => {
  const { getProject } = await import("../src/data/projects.js");
  const expectedDarkFrames = {
    consumer: ["04", "12"],
    enterprise: ["01", "02", "03", "07", "10", "11", "13"],
    campaign: ["01"],
  };

  for (const [slug, expected] of Object.entries(expectedDarkFrames)) {
    const frames = getProject(slug).frames;
    assert.equal(
      frames.every((frame) => ["light", "dark"].includes(frame.brandContrast)),
      true,
      slug,
    );
    assert.deepEqual(
      frames.filter((frame) => frame.brandContrast === "dark").map((frame) => frame.number),
      expected,
      slug,
    );
  }
});

test("home and case pages render declared light and dark brand regions", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const { getProject } = await import("../src/data/projects.js");
  const homeHtml = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(homeHtml, /class="home-page"[^>]*data-brand-region="true"[^>]*data-brand-contrast="light"/);
  assert.match(homeHtml, /id="process"[^>]*data-brand-region="true"[^>]*data-brand-contrast="dark"/);
  assert.match(homeHtml, /id="contact"[^>]*data-brand-region="true"[^>]*data-brand-contrast="dark"/);
  assert.match(homeHtml, /class="footer"[^>]*data-brand-region="true"[^>]*data-brand-contrast="dark"/);

  for (const slug of ["consumer", "enterprise", "campaign"]) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: `/work/${slug}` }));
    assert.match(html, /class="board-case [^"]+"[^>]*data-brand-region="true"[^>]*data-brand-contrast="light"/, slug);
    assert.equal(
      (html.match(/class="portfolio-board-entry"[^>]*data-brand-region="true"[^>]*data-brand-contrast="(?:light|dark)"/g) ?? []).length,
      getProject(slug).frames.length,
      slug,
    );
    assert.match(html, /class="case-flowing-menu"[^>]*data-brand-region="true"[^>]*data-brand-contrast="dark"/, slug);
  }
});

test("case pages lock the brand dark while the homepage stays adaptive", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const homeHtml = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(
    homeHtml,
    /<header[^>]*data-brand-contrast="light"[^>]*data-brand-contrast-mode="adaptive"/,
  );

  for (const slug of ["consumer", "enterprise", "campaign"]) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: `/work/${slug}` }));
    assert.match(
      html,
      /<header[^>]*data-brand-contrast="light"[^>]*data-brand-contrast-mode="fixed"/,
      slug,
    );
  }
});

test("every complete artboard is local and parseable", async () => {
  const { projects } = await import("../src/data/projects.js");
  const importedProjects = projects.filter((project) => project.frames);
  const assets = importedProjects.flatMap((project) => project.frames.map((frame) => frame.board));

  for (const item of assets) {
    assert.ok(item, "every imported frame should declare a complete board asset");
    for (const publicPath of [item.src, item.mobile].filter(Boolean)) {
      assert.match(publicPath, /^\/portfolio\/(consumer|enterprise|campaign)\//);
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

test("campaign artboards provide local desktop and mobile WebP exports", () => {
  for (let index = 1; index <= 5; index += 1) {
    const number = String(index).padStart(2, "0");
    for (const suffix of ["", "-960"]) {
      const publicPath = `/portfolio/campaign/boards/frame-${number}${suffix}.webp`;
      const filePath = path.join(process.cwd(), "public", ...publicPath.split("/").filter(Boolean));

      assert.equal(fs.existsSync(filePath), true, `${publicPath} should exist`);
      const bytes = fs.readFileSync(filePath);
      assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
      assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP");
    }
  }
});

test("home gallery data contains three live cases and one local placeholder", async () => {
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
    ["/work/consumer", "/work/enterprise", "/work/campaign", null],
  );
  assert.equal(projectGalleryItems.filter((item) => item.status === "COMING SOON").length, 1);
  const campaign = projectGalleryItems.find((item) => item.slug === "campaign");
  assert.equal(campaign.image, "/portfolio/campaign/boards/frame-01.webp");
  assert.equal(campaign.status, "骑福兽，闹新春");
  assert.equal(campaign.link, "/work/campaign");
  assert.equal(campaign.alt, "骑福兽，闹新春 H5 运营活动封面");
  for (const item of projectGalleryItems) {
    assert.match(item.image, /^\/portfolio\//);
    assert.doesNotMatch(item.image, /^https?:\/\//);
    const filePath = path.join(process.cwd(), "public", ...item.image.split("/").filter(Boolean));
    assert.equal(fs.existsSync(filePath), true, `${item.image} should exist`);
  }

  assert.deepEqual(homeSectionIds, ["top", "about", "work", "process", "contact"]);
  assert.equal(homeMarqueeRows.length, 2);
  assert.equal(homeMarqueeRows.every((row) => row.trim().length > 0), true);
});

test("design process data keeps five accountable steps and three local case proofs", async () => {
  const { designProcess } = await import("../src/data/designProcess.js");

  assert.deepEqual(
    designProcess.steps.map((step) => `${step.number} ${step.title}`),
    ["01 理解问题", "02 定义机会", "03 探索方案", "04 原型落地", "05 验证迭代"],
  );
  assert.equal(
    designProcess.steps.every((step) => step.aiRole.length > 0 && step.designerRole.length > 0),
    true,
  );
  assert.deepEqual(
    designProcess.evidence.map((item) => item.link),
    ["/work/consumer", "/work/enterprise", "/work/campaign"],
  );
  assert.deepEqual(
    designProcess.evidence.flatMap((item) => item.images.map((image) => image.src)),
    [
      "/portfolio/consumer/boards/frame-04.webp",
      "/portfolio/consumer/boards/frame-10.webp",
      "/portfolio/enterprise/boards/frame-14.webp",
      "/portfolio/campaign/boards/frame-02.webp",
    ],
  );

  for (const image of designProcess.evidence.flatMap((item) => item.images)) {
    assert.match(image.src, /^\/portfolio\/.+\.webp$/);
    assert.match(image.mobile, /-960\.webp$/);
    assert.equal(Number.isInteger(image.width) && image.width > 0, true);
    assert.equal(Number.isInteger(image.height) && image.height > 0, true);
    for (const publicPath of [image.src, image.mobile]) {
      const filePath = path.join(process.cwd(), "public", ...publicPath.split("/").filter(Boolean));
      assert.equal(fs.existsSync(filePath), true, `${publicPath} should exist`);
    }
  }
});

test("case footer data excludes the current case and appends the disabled AI product", async () => {
  const { caseFooterThemes, getCaseFooterItems } = await import("../src/data/projects.js");

  assert.deepEqual(
    getCaseFooterItems("consumer").map((item) => item.slug),
    ["enterprise", "campaign", "ai-product"],
  );
  assert.deepEqual(
    getCaseFooterItems("enterprise").map((item) => item.slug),
    ["consumer", "campaign", "ai-product"],
  );
  assert.deepEqual(
    getCaseFooterItems("campaign").map((item) => item.slug),
    ["consumer", "enterprise", "ai-product"],
  );

  const aiProduct = getCaseFooterItems("consumer").at(-1);
  assert.equal(aiProduct.text, "AI 产品 · 即将上线");
  assert.equal(aiProduct.image, "/portfolio/placeholders/ai-product.svg");
  assert.equal(aiProduct.disabled, true);
  assert.equal(aiProduct.link, undefined);

  assert.deepEqual(caseFooterThemes.health, {
    bgColor: "#0b0b0b",
    textColor: "#ffffff",
    marqueeBgColor: "#f7f6f2",
    marqueeTextColor: "#0b0b0b",
    borderColor: "#f7f6f2",
  });
  assert.deepEqual(caseFooterThemes.enterprise, {
    bgColor: "#0b0b0b",
    textColor: "#ffffff",
    marqueeBgColor: "#f7f6f2",
    marqueeTextColor: "#0b0b0b",
    borderColor: "#f7f6f2",
  });
  assert.deepEqual(caseFooterThemes.campaign, {
    bgColor: "#0b0b0b",
    textColor: "#ffffff",
    marqueeBgColor: "#f7f6f2",
    marqueeTextColor: "#0b0b0b",
    borderColor: "#f7f6f2",
  });
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

test("homepage CTA and hash navigation use their intended scroll behavior", async () => {
  const { scrollHomeHash, scrollToSection } = await vite.ssrLoadModule("/src/App.jsx");
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

  assert.equal(typeof scrollHomeHash, "function");
  assert.equal(scrollHomeHash("#work", documentRoot), true);
  assert.deepEqual(receivedOptions, { behavior: "auto", block: "start" });
  assert.equal(scrollHomeHash("#missing", documentRoot), false);
  assert.equal(scrollHomeHash("", documentRoot), false);
});

test("homepage defers cross-page hash positioning until the window load completes", async () => {
  const { scheduleHomeHashScroll } = await vite.ssrLoadModule("/src/App.jsx");
  let scrollOptions;
  const listeners = new Map();
  const frames = [];
  const section = {
    scrollIntoView(options) {
      scrollOptions = options;
    },
  };
  const documentRoot = {
    readyState: "loading",
    getElementById(id) {
      return id === "work" ? section : null;
    },
  };
  const windowRoot = {
    location: { hash: "#work" },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
    requestAnimationFrame(callback) {
      frames.push(callback);
      return frames.length;
    },
    cancelAnimationFrame() {},
  };

  assert.equal(typeof scheduleHomeHashScroll, "function");
  const cleanup = scheduleHomeHashScroll({ windowRoot, documentRoot });

  assert.equal(scrollOptions, undefined);
  assert.equal(frames.length, 0);
  assert.equal(typeof listeners.get("load"), "function");

  listeners.get("load")();
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.deepEqual(scrollOptions, { behavior: "auto", block: "start" });

  cleanup();
  assert.equal(listeners.has("load"), false);
});

test("home route renders the complete portfolio story", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(html, /DESIGN IN BLOOM/);
  assert.match(html, /Experience Designer \/ AI Product \/ Vibe Coding/);
  assert.match(html, /查看作品/);
  assert.match(html, /薛梓毅/);
  assert.match(html, /Ziyi Xue/);
  assert.match(html, /UI \/ UX \/ AI 体验设计/);
  assert.match(html, /\/about\/ziyi-xue-cutout\.png/);
  assert.match(html, /浙江数智交院科技股份有限公司/);
  assert.match(html, /href="tel:18668155572"/);
  assert.match(html, /href="mailto:2830008192@qq\.com"/);
  assert.match(html, /onodera1006/);
  assert.doesNotMatch(html, /ABOUT \/ ME/);
  assert.doesNotMatch(html, /pc-card-wrapper|data-tilt-enabled/);
  assert.match(html, /精选作品/);
  assert.match(html, /我的设计工作流/);
  assert.match(html, /保持联系/);
  const sectionOrder = ["about", "work", "process", "contact"].map(
    (sectionId) => html.indexOf(`id="${sectionId}"`),
  );
  assert.equal(sectionOrder.every((position) => position >= 0), true);
  assert.deepEqual(sectionOrder, [...sectionOrder].sort((a, b) => a - b));
  assert.match(html, /href="#work"/);
  assert.equal((html.match(/data-specular-button="true"/g) ?? []).length, 1);
  assert.match(html, /<button[^>]*data-specular-button="true"[^>]*>[\s\S]*查看作品[\s\S]*<\/button>/);
  assert.doesNotMatch(html, /class="button button-light" href="#work"/);
  assert.doesNotMatch(html, /ai-terminal-card|QUESTION \/ EXPLORE \/ VERIFY/);
  assert.doesNotMatch(html, /data-hero-unicorn|unicornstudio/i);
  assert.doesNotMatch(html, /FULLSCREEN VIDEO PLACEHOLDER|<video/);
  assert.equal((html.match(/class="accordion-gallery/g) ?? []).length, 1);
  assert.equal((html.match(/class="ag-panel"/g) ?? []).length, 4);
  assert.equal((html.match(/ag-panel--active/g) ?? []).length, 0);
  assert.match(html, /\/portfolio\/consumer\/boards\/frame-01\.webp/);
  assert.match(html, /\/portfolio\/enterprise\/boards\/frame-01\.webp/);
  assert.match(html, /\/portfolio\/campaign\/boards\/frame-01\.webp/);
  assert.doesNotMatch(html, /\/portfolio\/campaign\/cover-frame-4\.webp/);
  assert.match(html, /\/portfolio\/placeholders\/ai-product\.svg/);
  assert.doesNotMatch(html, /class="project-card/);
});

test("home route mounts one opening bloom without replacing the hero", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.equal((html.match(/data-opening-bloom="true"/g) ?? []).length, 1);
  assert.match(html, /aria-label="点击花朵进入 XUE STUDIO"/);
  assert.match(html, /data-bee-swarm="true"/);
  assert.match(html, /data-bloom-physics="true"/);
  assert.match(html, /DESIGN IN BLOOM/);
});

test("homepage removes the interaction lab without changing the remaining section order", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const { sidebarMenuGroups } = await import("../src/data/sidebarMenu.js");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.doesNotMatch(
    html,
    /id="lab"|href="#lab"|XUE(?:&#x27;|')S LAB|设计决策实验室|lab-section/,
  );
  assert.equal((html.match(/class="pill"/g) ?? []).length, 4);

  const sectionOrder = ["about", "work", "process", "contact"].map(
    (sectionId) => html.indexOf(`id="${sectionId}"`),
  );
  assert.equal(sectionOrder.every((position) => position >= 0), true);
  assert.deepEqual(sectionOrder, [...sectionOrder].sort((a, b) => a - b));
  assert.deepEqual(
    sidebarMenuGroups.map((group) => group.title),
    ["HOME", "ABOUT", "PROJECTS", "PROCESS", "CONTACT"],
  );
});

test("homepage uses the Design in Bloom swarm and removes the old color backgrounds", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
  );

  assert.equal((html.match(/data-bee-swarm="true"/g) ?? []).length, 1);
  assert.match(html, /\/hero\/design-in-bloom\/flower\.png/);
  assert.match(html, /\/hero\/design-in-bloom\/bee\.png/);
  assert.equal((html.match(/data-faulty-terminal="true"/g) ?? []).length, 0);
  assert.doesNotMatch(html, /ai-terminal-card|QUESTION \/ EXPLORE \/ VERIFY/);
  assert.doesNotMatch(html, /soft-aurora|home-liquid-background|hero-aurora/i);
  assert.equal(packageJson.dependencies.three, undefined);
  assert.equal((html.match(/class="accordion-gallery/g) ?? []).length, 1);
});

test("homepage exposes the bloom physics layer and marquee floor", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(html, /data-bloom-physics="true"/);
  assert.match(html, /data-burst-count="8"/);
  assert.match(html, /data-mobile-burst-count="5"/);
  assert.match(html, /data-max-flowers="30"/);
  assert.match(html, /data-settle-ms="10000"/);
  assert.match(html, /data-fade-ms="800"/);
  assert.match(html, /data-flower-floor="true"/);
  assert.match(html, /data-bloom-trigger="true"/);
  assert.match(html, /aria-label="点击花束，让花朵绽放"/);
});

test("home headings use a semantic one-time character reveal", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.equal((html.match(/data-blur-text="true"/g) ?? []).length, 4);
  assert.match(html, /<h1[^>]*data-blur-text="true"/);
  assert.equal((html.match(/<h2[^>]*data-blur-text="true"/g) ?? []).length, 3);
  assert.match(html, /class="fade-content home-reveal"/);
});

test("hero title scrambles fixed character slots into the local bee image", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  const heading = html.match(/<h1[^>]*aria-label="DESIGN IN BLOOM"[\s\S]*?<\/h1>/)?.[0] ?? "";

  assert.match(heading, /data-scrambled-text="true"/);
  assert.match(heading, /data-scramble-trigger="title"/);
  assert.match(heading, /data-scramble-radius="120"/);
  assert.match(heading, /data-scramble-limit="3"/);
  assert.equal((heading.match(/class="blur-text__scramble-slot"/g) ?? []).length, 13);
  assert.equal((heading.match(/blur-text__scramble-bee/g) ?? []).length, 13);
  assert.equal((heading.match(/blur-text__scramble-flower/g) ?? []).length, 13);
  assert.equal((heading.match(/blur-text__scramble-art/g) ?? []).length, 26);
  assert.equal((heading.match(/src="\/hero\/design-in-bloom\/bee\.png"/g) ?? []).length, 13);
  assert.equal((heading.match(/src="\/hero\/design-in-bloom\/flower-sprite\.png"/g) ?? []).length, 13);
  assert.doesNotMatch(heading, /variable-proximity|proximity-glyph/);
  assert.equal((heading.match(/aria-label="DESIGN IN BLOOM"/g) ?? []).length, 1);
});

test("homepage uses the standard React Bits pill motion without a pill logo", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const homeHtml = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  const caseHtml = renderToStaticMarkup(
    React.createElement(App, { initialPath: "/work/consumer" }),
  );

  assert.doesNotMatch(homeHtml, /data-motion-profile="apple"/);
  assert.doesNotMatch(homeHtml, /class="pill-logo"/);
  assert.ok((homeHtml.match(/data-enter-reveal="true"/g) ?? []).length >= 10);
  assert.doesNotMatch(caseHtml, /data-motion-profile="apple"/);
});

test("PillNav exposes a black hover fill and transparent idle pills without an icon", async () => {
  const { default: PillNav } = await vite.ssrLoadModule("/src/components/PillNav.jsx");
  const html = renderToStaticMarkup(
    React.createElement(PillNav, {
      items: [{ label: "作品", href: "#work" }],
    }),
  );

  assert.match(html, /style="--base:#000000;--pill-bg:transparent;--hover-text:#ffffff;--pill-text:#000000"/);
  assert.doesNotMatch(html, /class="pill-logo"|<img/);
});

test("homepage navigation uses Chinese labels with the existing section anchors", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  for (const [label, href] of [
    ["关于", "#about"],
    ["作品", "#work"],
    ["过程", "#process"],
    ["联系", "#contact"],
  ]) {
    assert.match(html, new RegExp(`<a href="${href}"[^>]*aria-label="${label}"`));
  }
});

test("homepage uses one shared capsule with transparent hover-only items", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const homeHtml = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));
  const detailHtml = renderToStaticMarkup(
    React.createElement(App, { initialPath: "/work/consumer" }),
  );
  const detailDesktopNav = detailHtml.match(
    /<div class="pill-nav-desktop">[\s\S]*?<\/div>/,
  )?.[0] ?? "";
  const pillCss = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "PillNav.css"),
    "utf8",
  );

  assert.doesNotMatch(homeHtml, /pill-nav--frameless/);
  assert.match(homeHtml, /--pill-bg:transparent/);
  assert.equal((homeHtml.match(/class="pill-hover-circle"/g) ?? []).length, 4);
  assert.doesNotMatch(detailDesktopNav, /is-active/);
  assert.match(pillCss, /\.pill-nav \.pill::after\s*\{[^}]*content:\s*none/s);
});

test("homepage continuous effects pause responsibly and the gallery restores its original motion", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.equal((html.match(/data-continuous-motion="managed"/g) ?? []).length, 2);
  assert.match(html, /class="accordion-gallery[^\"]*"[^>]*data-layout-animation="flex"/);
  assert.match(html, /data-animation-duration="0\.6"/);
});

test("BlurText does not clip its animated glyphs at the line box", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(css, /\.blur-text\s*\{[^}]*overflow:\s*visible/s);
  assert.doesNotMatch(css, /\.blur-text\s*\{[^}]*overflow:\s*hidden/s);
});

test("the flower, swarm and hero copy keep distinct visual layers", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(html, /class="bee-swarm__trail"/);
  assert.match(html, /class="bee-swarm__bees"/);
  assert.match(html, /class="bee-swarm__foreground"/);
  assert.match(html, /class="bloom-hero-copy"/);
  assert.doesNotMatch(html, /ai-terminal-card|QUESTION \/ EXPLORE \/ VERIFY/);
  assert.ok(html.indexOf('class="bee-swarm__trail"') < html.indexOf('class="bee-swarm__bees"'));
  assert.ok(html.indexOf('class="bee-swarm__bees"') < html.indexOf('class="bee-swarm__foreground"'));
});

test("homepage renders the React Bits process board without the retired AI terminal", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.match(html, /PROCESS \/ AI × DESIGN/);
  assert.match(html, /我的设计工作流/);
  assert.match(html, /AI 参与从研究到验证的全过程，但不替代证据、取舍与责任。/);
  assert.equal((html.match(/data-process-step=/g) ?? []).length, 5);
  assert.equal((html.match(/<dt>AI 参与<\/dt>/g) ?? []).length, 8);
  assert.equal((html.match(/<dt>我的判断<\/dt>/g) ?? []).length, 8);
  assert.equal((html.match(/data-process-evidence=/g) ?? []).length, 3);
  for (const href of ["/work/consumer", "/work/enterprise", "/work/campaign"]) {
    assert.match(html, new RegExp(`href="${href}"`));
  }
  assert.equal((html.match(/data-spotlight-card="true"/g) ?? []).length, 8);
  assert.equal((html.match(/data-scroll-reveal="true"/g) ?? []).length, 1);
  assert.ok((html.match(/data-scroll-reveal-token="true"/g) ?? []).length >= 20);
  assert.equal((html.match(/class="process-evidence__image"/g) ?? []).length, 4);
  assert.ok((html.match(/loading="lazy"/g) ?? []).length >= 4);
  assert.ok((html.match(/decoding="async"/g) ?? []).length >= 4);
  assert.doesNotMatch(html, /aria-label="AI 帮我更快地产生可能性；研究证据、体验判断与最终责任仍由我承担。"/);
  assert.doesNotMatch(html, /ai-terminal-card|ai-terminal|QUESTION \/ EXPLORE \/ VERIFY/);
});

test("the process board owns its dark theme instead of inheriting the editorial paper section", () => {
  const globalCss = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");
  const processCss = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "DesignProcess.css"),
    "utf8",
  );

  assert.doesNotMatch(
    globalCss,
    /\.home-page \.about-section,[\s\S]*?\.home-page \.ai-section,[\s\S]*?background:\s*var\(--bloom-paper\)/,
  );
  assert.doesNotMatch(globalCss, /\.home-page \.ai-section\s*\{[^}]*background:/s);
  assert.match(processCss, /\.home-page \.process-board \.process-board__eyebrow\s*\{/);
});

test("process ending becomes a full-bleed DriftWall without a center statement panel", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.equal((html.match(/data-drift-wall="true"/g) ?? []).length, 1);
  assert.match(html, /id="process-drift-wall"/);
  assert.equal((html.match(/class="drift-wall__column"/g) ?? []).length, 5);
  assert.equal((html.match(/drift-wall__cap/g) ?? []).length, 0);
  assert.equal((html.match(/class="drift-wall__image"/g) ?? []).length, 60);
  assert.equal((html.match(/loading="eager"/g) ?? []).length, 60);
  assert.match(html, /\/portfolio\/consumer\/boards\/frame-04\.webp/);
  assert.match(html, /\/portfolio\/enterprise\/boards\/frame-14\.webp/);
  assert.match(html, /\/portfolio\/campaign\/boards\/frame-02\.webp/);
  assert.match(html, /-960\.webp/);
  assert.doesNotMatch(html, /vertical-project-marquee__statement/);
  assert.doesNotMatch(html, /AI 帮我更快地产生可能性；研究证据、体验判断与最终责任仍由我承担。/);
  assert.doesNotMatch(html, /scroll-reveal process-board__conclusion/);

  const driftWallCss = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "DriftWall.css"),
    "utf8",
  );
  assert.match(
    driftWallCss,
    /\.drift-wall\s*\{[^}]*perspective:\s*var\(--drift-perspective/s,
  );
  assert.match(
    driftWallCss,
    /\.drift-wall__plane\s*\{[^}]*transform-style:\s*preserve-3d/s,
  );
  assert.match(
    driftWallCss,
    /\.drift-wall__column\s*\{[^}]*overflow:\s*visible/s,
  );
  assert.match(
    driftWallCss,
    /\.drift-wall__media\.is-active\s*\{[^}]*transform:\s*translate3d\(0,\s*-12px,\s*var\(--drift-lift,\s*76px\)\)/s,
  );
  assert.match(driftWallCss, /--drift-tile-width:\s*303\.6px/);
  assert.match(driftWallCss, /--drift-tile-height:\s*194\.81px/);
  assert.match(driftWallCss, /--drift-gap:\s*12px/);
  assert.match(driftWallCss, /--drift-column-gap:\s*24px/);
  assert.match(
    driftWallCss,
    /\.drift-wall__plane\s*\{[^}]*gap:\s*var\(--drift-column-gap\)/s,
  );
  assert.match(driftWallCss, /--drift-radius:\s*16px/);
  assert.match(driftWallCss, /filter:\s*grayscale\(var\(--drift-grayscale,\s*1\)\)/);
  assert.match(
    driftWallCss,
    /\.drift-wall__media\.is-active\s*\{[^}]*filter:\s*grayscale\(0\)/s,
  );
  assert.match(
    driftWallCss,
    /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1024px\)[\s\S]*\.drift-wall__column:nth-child\(n \+ 5\)/s,
  );
  assert.match(
    driftWallCss,
    /@media\s*\(max-width:\s*767px\)[\s\S]*\.drift-wall__column:nth-child\(n \+ 3\)/s,
  );
  assert.match(
    driftWallCss,
    /@media\s*\(max-width:\s*767px\)[\s\S]*--drift-column-gap:\s*18px[\s\S]*--drift-tile-width:\s*198\.72px[\s\S]*--drift-tile-height:\s*127\.44px/s,
  );
});

test("SpotlightCard enables pointer tracking only for fine hover pointers", async () => {
  const { canUseSpotlightPointer } = await vite.ssrLoadModule(
    "/src/components/SpotlightCard.jsx",
  );

  assert.equal(canUseSpotlightPointer(), false);
  assert.equal(canUseSpotlightPointer({ matchMedia: () => ({ matches: false }) }), false);
  assert.equal(canUseSpotlightPointer({ matchMedia: () => ({ matches: true }) }), true);
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
  const campaignHtml = renderToStaticMarkup(
    React.createElement(App, { initialPath: "/work/campaign" }),
  );

  assert.match(consumerHtml, /AI健康管家一站式服务平台/);
  assert.equal((consumerHtml.match(/class="portfolio-board"/g) ?? []).length, 15);
  assert.equal((consumerHtml.match(/data-figma-node=/g) ?? []).length, 15);
  assert.equal((consumerHtml.match(/class="portfolio-board-entry"/g) ?? []).length, 15);
  assert.equal((consumerHtml.match(/class="line-sidebar__item"/g) ?? []).length, 15);
  assert.match(consumerHtml, /--accent-color:#0b0b0b/);
  assert.match(consumerHtml, /id="case-frame-consumer-1"/);
  assert.match(enterpriseHtml, /跨境电商异常中枢平台/);
  assert.match(enterpriseHtml, /可交互 Demo/);
  assert.match(enterpriseHtml, /<iframe[^>]+src="\/portfolio\/enterprise\/demo\/index\.html"/);
  assert.doesNotMatch(enterpriseHtml, /Demo 地址稍后补充/);
  assert.equal((enterpriseHtml.match(/class="portfolio-board"/g) ?? []).length, 14);
  assert.equal((enterpriseHtml.match(/data-figma-node=/g) ?? []).length, 14);
  assert.equal((enterpriseHtml.match(/class="portfolio-board-entry"/g) ?? []).length, 14);
  assert.equal((enterpriseHtml.match(/class="line-sidebar__item"/g) ?? []).length, 14);
  assert.match(enterpriseHtml, /--accent-color:#0b0b0b/);
  assert.match(enterpriseHtml, /id="case-frame-enterprise-14"/);
  assert.match(campaignHtml, /骑福兽，闹新春/);
  assert.equal((campaignHtml.match(/class="portfolio-board"/g) ?? []).length, 5);
  assert.equal((campaignHtml.match(/class="portfolio-board-entry"/g) ?? []).length, 5);
  assert.equal((campaignHtml.match(/class="line-sidebar__item"/g) ?? []).length, 5);
  assert.match(campaignHtml, /--accent-color:#0b0b0b/);
  assert.match(campaignHtml, /--text-color:#66645f/);
  assert.match(campaignHtml, /--marker-color:#aaa79f/);
  assert.match(campaignHtml, /class="case-chapter-nav is-campaign"/);
  assert.doesNotMatch(campaignHtml, /--accent-color:#006cff/);
  assert.match(campaignHtml, /id="case-frame-campaign-5"/);
  assert.ok(
    campaignHtml.indexOf('data-figma-node="campaign:05"') <
      campaignHtml.indexOf('class="case-flowing-menu'),
  );
  assert.doesNotMatch(`${consumerHtml}${enterpriseHtml}${campaignHtml}`, /scroll-stack-/);
  assert.doesNotMatch(`${consumerHtml}${enterpriseHtml}${campaignHtml}`, /figma-frame-copy|figma-metrics|figma-journey/);
  assert.ok(enterpriseHtml.indexOf('data-figma-node="808:9910"') < enterpriseHtml.indexOf('class="demo-embed'));
  assert.ok(enterpriseHtml.indexOf('class="demo-embed') < enterpriseHtml.indexOf('data-figma-node="808:9807"'));
  assert.ok(
    enterpriseHtml.indexOf('data-figma-node="808:12759"') <
      enterpriseHtml.indexOf('class="case-flowing-menu'),
  );
  assert.doesNotMatch(`${consumerHtml}${enterpriseHtml}`, /2830008192@qq\.com|2026我能找到工作吗|我是文案|figma\.com\/api\/mcp\/asset/);
});

test("portfolio detail chrome stays readable on the light editorial background", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const detailHtml = ["consumer", "enterprise", "campaign"]
    .map((slug) => renderToStaticMarkup(
      React.createElement(App, { initialPath: `/work/${slug}` }),
    ))
    .join("");
  const css = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.equal((detailHtml.match(/sm-menu-trigger sm-trigger-inherit/g) ?? []).length, 3);
  assert.equal(
    (detailHtml.match(/<header[^>]*data-brand-contrast="light"/g) ?? []).length,
    3,
  );
  assert.doesNotMatch(detailHtml, /sm-menu-trigger sm-trigger-light/);
  assert.match(
    css,
    /\.board-case-enterprise \.demo-embed\s*\{[^}]*color:\s*#0b0b0b/s,
  );
  assert.match(
    css,
    /\.board-case-enterprise \.demo-heading p,[\s\S]*?\.board-case-enterprise \.demo-open-link\s*\{[^}]*color:\s*#0b0b0b/s,
  );
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

test("campaign case keeps its artboards inside the shared editorial chrome", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const html = renderToStaticMarkup(React.createElement(App, { initialPath: "/work/campaign" }));

  assert.match(html, /class="board-case board-case-campaign"/);
  assert.match(html, /class="case-flowing-menu"/);
  assert.match(html, /background-color:#0b0b0b/);
  assert.match(html, /border-color:#f7f6f2/);
});

test("FlowingMenu renders linked projects and a non-navigating AI placeholder", async () => {
  const { default: FlowingMenu } = await vite.ssrLoadModule("/src/components/FlowingMenu.jsx");
  const items = [
    {
      slug: "enterprise",
      text: "跨境电商异常中枢平台",
      image: "/portfolio/enterprise/boards/frame-01.webp",
      link: "/work/enterprise",
    },
    {
      slug: "campaign",
      text: "骑福兽，闹新春",
      image: "/portfolio/campaign/boards/frame-01.webp",
      link: "/work/campaign",
    },
    {
      slug: "ai-product",
      text: "AI 产品 · 即将上线",
      image: "/portfolio/placeholders/ai-product.svg",
      disabled: true,
    },
  ];
  const html = renderToStaticMarkup(
    React.createElement(FlowingMenu, {
      items,
      bgColor: "#ccecff",
      textColor: "#16324b",
      marqueeBgColor: "#16324b",
      marqueeTextColor: "#ccecff",
      borderColor: "#16324b",
    }),
  );

  assert.equal((html.match(/class="flowing-menu__item"/g) ?? []).length, 3);
  assert.match(html, /href="\/work\/enterprise"/);
  assert.match(html, /href="\/work\/campaign"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /AI 产品 · 即将上线/);
  assert.doesNotMatch(html, /href="\/work\/ai-product"/);
  assert.match(html, /background-color:#ccecff/);
  assert.match(html, /border-color:#16324b/);
});

test("every project route ends with its themed menu of other projects", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const cases = [
    {
      route: "/work/consumer",
      excluded: "AI健康管家一站式服务平台",
      included: ["跨境电商异常中枢平台", "骑福兽，闹新春"],
      background: "#0b0b0b",
      foreground: "#f7f6f2",
    },
    {
      route: "/work/enterprise",
      excluded: "跨境电商异常中枢平台",
      included: ["AI健康管家一站式服务平台", "骑福兽，闹新春"],
      background: "#0b0b0b",
      foreground: "#f7f6f2",
    },
    {
      route: "/work/campaign",
      excluded: "骑福兽，闹新春",
      included: ["AI健康管家一站式服务平台", "跨境电商异常中枢平台"],
      background: "#0b0b0b",
      foreground: "#f7f6f2",
    },
  ];

  for (const { route, excluded, included, background, foreground } of cases) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: route }));
    const footerStart = html.indexOf('class="case-flowing-menu"');
    assert.notEqual(footerStart, -1, route);
    const footer = html.slice(footerStart);

    assert.equal((footer.match(/class="flowing-menu__item"/g) ?? []).length, 3, route);
    assert.doesNotMatch(footer, new RegExp(excluded));
    for (const title of included) assert.match(footer, new RegExp(title));
    assert.match(footer, /AI 产品 · 即将上线/);
    assert.match(footer, /aria-disabled="true"/);
    assert.equal((footer.match(/href="\/work\//g) ?? []).length, 2, route);
    assert.match(footer, new RegExp(`background-color:${background}`));
    assert.match(footer, new RegExp(`border-color:${foreground}`));
    assert.doesNotMatch(footer, /查看其他案例|depth-text/);
  }
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
  const accordionCss = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "AccordionGallery.css"),
    "utf8",
  );

  assert.match(
    css,
    /\.project-gallery-shell\s*\{[^}]*width:\s*min\(calc\(100%\s*-\s*clamp\(48px,\s*7vw,\s*132px\)\),\s*1700px\)/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*520px\)[\s\S]*\.project-gallery-shell\s*\{[^}]*width:\s*calc\(100%\s*-\s*32px\)/,
  );
  assert.match(
    css,
    /\.home-page \.accordion-gallery\s*\{[^}]*overflow:\s*clip/s,
  );
  assert.match(
    accordionCss,
    /\.ag-panel__status\s*\{[^}]*color:\s*rgb\(255 255 255 \/ 82%\)/s,
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

test("PillNav keeps desktop items hover-only while preserving the mobile active item", async () => {
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
  const desktopNav = html.match(/<div class="pill-nav-desktop">[\s\S]*?<\/div>/)?.[0] ?? "";

  assert.match(html, /^<nav\b[^>]*aria-label="主导航"/);
  assert.doesNotMatch(desktopNav, /is-active/);
  assert.match(html, /<a href="\/#work" class="is-active">作品<\/a>/);
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

test("every public route uses the editorial four-link navigation with GitHub and contact actions", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");
  const homeHtml = renderToStaticMarkup(React.createElement(App, { initialPath: "/" }));

  assert.equal((homeHtml.match(/class="site-nav"/g) ?? []).length, 1);
  assert.equal((homeHtml.match(/class="wordmark"/g) ?? []).length, 1);
  assert.match(homeHtml, /XUE STUDIO/);
  assert.equal((homeHtml.match(/class="pill"/g) ?? []).length, 4);
  assert.match(homeHtml, /href="https:\/\/github\.com\/onodera520\/xzy-portfolio"/);
  assert.match(homeHtml, /target="_blank"/);
  assert.match(homeHtml, /rel="noreferrer"/);
  assert.match(homeHtml, /aria-label="在 GitHub 查看 XZY Portfolio"/);
  assert.match(homeHtml, /class="nav-github"/);
  assert.match(homeHtml, /<svg[^>]*class="nav-github__icon"/);
  assert.doesNotMatch(homeHtml, />CV<\/a>/);
  assert.match(homeHtml, /aria-label="联系 XUE STUDIO"/);
  assert.match(homeHtml, /<button[^>]*class="nav-mail"[^>]*aria-haspopup="dialog"[^>]*aria-expanded="false"/);
  assert.equal((homeHtml.match(/aria-haspopup="dialog"/g) ?? []).length, 2);
  assert.match(
    homeHtml,
    /<button[^>]*class="contact-mark"[^>]*aria-label="打开联系方式"[^>]*aria-haspopup="dialog"/,
  );
  assert.doesNotMatch(homeHtml, /<a[^>]*class="nav-mail"/);
  assert.doesNotMatch(homeHtml, /class="contact-modal"/);
  for (const href of ["#about", "#work", "#process", "#contact"]) {
    assert.match(homeHtml, new RegExp(`href="${href}"`));
  }

  for (const route of ["/work/consumer", "/work/enterprise", "/work/campaign"]) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: route }));
    assert.equal((html.match(/class="site-nav site-nav-solid"/g) ?? []).length, 1, route);
    assert.equal((html.match(/class="pill(?: is-active)?"/g) ?? []).length, 4, route);
    assert.match(html, /href="\/#work"/);
    assert.match(html, /href="\/#about"/);
    assert.match(html, /href="\/#process"/);
    assert.match(html, /href="\/#contact"/);
    assert.match(html, /href="https:\/\/github\.com\/onodera520\/xzy-portfolio"/);
    assert.match(html, /aria-label="在 GitHub 查看 XZY Portfolio"/);
    assert.doesNotMatch(html, /class="pill is-active"/);
    assert.match(html, /<a href="\/#work" class="is-active">作品<\/a>/);
  }
});

test("ContactModal renders only when open with the approved links and existing decorations", async () => {
  const { default: ContactModal } = await vite.ssrLoadModule("/src/components/ContactModal.jsx");
  const closedHtml = renderToStaticMarkup(
    React.createElement(ContactModal, { open: false, onClose() {} }),
  );
  const openHtml = renderToStaticMarkup(
    React.createElement(ContactModal, { open: true, onClose() {} }),
  );

  assert.equal(closedHtml, "");
  assert.match(openHtml, /role="dialog"/);
  assert.match(openHtml, /aria-modal="true"/);
  assert.match(openHtml, /src="\/contact\/wechat-qr\.png"/);
  assert.match(openHtml, /alt="微信二维码"/);
  assert.match(openHtml, /微信联系/);
  assert.match(openHtml, /保持联系/);
  assert.match(openHtml, /通过邮箱联系/);
  assert.match(openHtml, /href="https:\/\/wx\.mail\.qq\.com\/\?cancel_login=true&amp;from=get_ticket_fail"/);
  assert.match(openHtml, /target="_blank"/);
  assert.match(openHtml, /src="\/contact\/qq-logo\.png"/);
  assert.match(openHtml, /class="contact-modal__qq-logo"/);
  assert.doesNotMatch(openHtml, /<span[^>]*>↗<\/span>/);
  assert.match(openHtml, /src="\/hero\/design-in-bloom\/bee\.png"/);
  assert.match(openHtml, /src="\/hero\/design-in-bloom\/flower\.png"/);
  assert.match(openHtml, /src="\/hero\/design-in-bloom\/flower-sprite\.png"/);
});

test("the contact modal uses the provided local WeChat QR image", () => {
  const qrPath = path.join(process.cwd(), "public", "contact", "wechat-qr.png");

  assert.equal(fs.existsSync(qrPath), true);
  const bytes = fs.readFileSync(qrPath);
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(bytes.readUInt32BE(16), 662);
  assert.equal(bytes.readUInt32BE(20), 662);
});

test("the contact modal uses the provided local square QQ logo", () => {
  const logoPath = path.join(process.cwd(), "public", "contact", "qq-logo.png");

  assert.equal(fs.existsSync(logoPath), true);
  const bytes = fs.readFileSync(logoPath);
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(bytes.readUInt32BE(16), bytes.readUInt32BE(20));
});

test("the homepage contact mark inverts with pointer-safe motion and a reduced-motion fallback", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(
    styles,
    /\.contact-mark:focus-visible\s*{[^}]*background:\s*var\(--bloom-ink\)[^}]*color:\s*#fff[^}]*rotate\(8deg\) scale\(1\.04\)/s,
  );
  assert.match(
    styles,
    /@media \(hover: hover\) and \(pointer: fine\)\s*{[^}]*\.contact-mark:hover\s*{[^}]*background:\s*var\(--bloom-ink\)[^}]*color:\s*#fff[^}]*rotate\(8deg\) scale\(1\.04\)/s,
  );
  assert.match(
    styles,
    /\.contact-mark:active\s*{[^}]*rotate\(8deg\) scale\(0\.97\)/s,
  );
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)\s*{[^}]*\.contact-mark[^}]*{[^}]*transition-duration:\s*0ms[^}]*rotate\(8deg\) scale\(1\)/s,
  );
});

test("the homepage contact container does not clip the transformed contact mark", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(
    styles,
    /\.home-page \.contact-inner\s*{[^}]*width:\s*min\([^}]*overflow:\s*visible/s,
  );
});

test("the editorial About portrait is a local PNG with transparency", () => {
  const portraitPath = path.join(process.cwd(), "public", "about", "ziyi-xue-cutout.png");
  assert.equal(fs.existsSync(portraitPath), true);

  const bytes = fs.readFileSync(portraitPath);
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(bytes.readUInt32BE(16), 1024);
  assert.equal(bytes.readUInt32BE(20), 1536);
  assert.ok([4, 6].includes(bytes[25]), "portrait PNG must include an alpha channel");
});

test("editorial About keeps its desktop split and mobile portrait-first layout", () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "EditorialAbout.css"),
    "utf8",
  );

  assert.match(
    css,
    /grid-template-columns:\s*minmax\(0,\s*58fr\)\s+minmax\(320px,\s*42fr\)/,
  );
  assert.match(css, /border-radius:\s*32px/);
  assert.match(css, /filter:\s*grayscale\(1\)/);
  assert.match(
    css,
    /\.editorial-about__info\s*\{[^}]*padding-bottom:\s*clamp\(32px,\s*3vw,\s*52px\)/s,
  );
  assert.match(
    css,
    /\.editorial-about__portrait-stage\s*\{[^}]*--portrait-headroom:\s*clamp\(120px,\s*11vw,\s*190px\)[^}]*align-items:\s*flex-end/s,
  );
  assert.match(
    css,
    /\.editorial-about__portrait-image\s*\{[^}]*width:\s*auto[^}]*height:\s*calc\(100%\s*-\s*var\(--portrait-headroom\)\)[^}]*object-fit:\s*contain[^}]*object-position:\s*center bottom/s,
  );
  assert.match(
    css,
    /\.editorial-about__portrait-stage\s*\{[^}]*position:\s*relative/s,
  );
  assert.match(
    css,
    /\.editorial-about__portrait-image\s*\{[^}]*position:\s*absolute[^}]*bottom:\s*0[^}]*left:\s*50%[^}]*transform:\s*translateX\(-50%\)/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*767px\)[\s\S]*grid-template-areas:\s*"portrait"\s*"info"/,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1024px\)\s*\{\s*\.editorial-about\s*\{[^}]*grid-template-columns:\s*1fr[^}]*grid-template-areas:\s*"portrait"\s*"info"/,
  );
  assert.match(css, /overflow-wrap:\s*anywhere/);
});

test("editorial About introduction and strengths use the full information column", () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "EditorialAbout.css"),
    "utf8",
  );

  assert.match(
    css,
    /\.editorial-about__intro\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/s,
  );
  assert.match(
    css,
    /\.editorial-about__strength-list\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/s,
  );
  assert.match(
    css,
    /\.editorial-about__strength-list li\s*\{[^}]*max-width:\s*none/s,
  );
});

test("editorial About data contains the complete public profile", async () => {
  const { aboutProfile } = await import("../src/data/aboutProfile.js");

  assert.equal(aboutProfile.name, "薛梓毅");
  assert.equal(aboutProfile.englishName, "Ziyi Xue");
  assert.equal(aboutProfile.education.length, 2);
  assert.equal(aboutProfile.experience.achievements.length, 5);
  assert.equal(aboutProfile.strengths.length, 3);
  assert.deepEqual(
    aboutProfile.strengths.map((item) => item.title),
    ["Agent深度实践与研究", "全场景AI设计提效", "AI落地能力"],
  );
  assert.deepEqual(
    aboutProfile.contacts.map((item) => item.value),
    ["18668155572", "2830008192@qq.com", "onodera1006"],
  );
});

test("EditorialAbout renders quantified achievements as semantic emphasis", async () => {
  const { aboutProfile } = await import("../src/data/aboutProfile.js");
  const { default: EditorialAbout } = await vite.ssrLoadModule(
    "/src/components/EditorialAbout.jsx",
  );
  const html = renderToStaticMarkup(
    React.createElement(EditorialAbout, { profile: aboutProfile }),
  );

  for (const value of [
    "20+ 核心页面",
    "AI Coding",
    "50%",
    "20+ 高频组件",
    "30%",
    "95%+",
  ]) {
    assert.match(html, new RegExp(`<strong>${value.replaceAll("+", "\\+")}</strong>`));
  }
  for (const title of ["Agent深度实践与研究", "全场景AI设计提效", "AI落地能力"]) {
    assert.match(html, new RegExp(`<strong>${title}</strong>`));
  }
  assert.match(html, /Codex/);
  assert.match(html, /Claude Code/);
  assert.match(html, /Harness/);
  assert.match(html, /更少的 Token/);
  assert.match(html, /Vibe Coding/);
  assert.match(html, /标准化 AI 视觉工作流或 Skill/);
  assert.match(html, /href="tel:18668155572"/);
  assert.match(html, /href="mailto:2830008192@qq\.com"/);
  assert.match(html, /<span[^>]*>onodera1006<\/span>/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /width="1024"/);
  assert.match(html, /height="1536"/);
  assert.match(html, /id="about-details"/);
  const portraitIndex = html.indexOf('class="editorial-about__portrait"');
  const contactsIndex = html.indexOf('class="editorial-about__contacts"');
  const portraitImageIndex = html.indexOf('class="editorial-about__portrait-image"');
  assert.ok(
    portraitIndex < contactsIndex && contactsIndex < portraitImageIndex,
    "contacts should sit above the portrait image inside the portrait column",
  );
});

test("PortraitChromaReveal renders a grayscale portrait with a decorative color layer", async () => {
  const { aboutProfile } = await import("../src/data/aboutProfile.js");
  const { default: PortraitChromaReveal } = await vite.ssrLoadModule(
    "/src/components/PortraitChromaReveal.jsx",
  );
  const html = renderToStaticMarkup(
    React.createElement(PortraitChromaReveal, {
      portrait: aboutProfile.portrait,
    }),
  );

  assert.equal((html.match(/src="\/about\/ziyi-xue-cutout\.png"/g) ?? []).length, 2);
  assert.equal((html.match(/class="editorial-about__portrait-image/g) ?? []).length, 2);
  assert.match(html, new RegExp(`alt="${aboutProfile.portrait.alt}"`));
  assert.match(html, /alt=""[^>]*aria-hidden="true"/);
  assert.match(html, /class="editorial-about__portrait-stage portrait-chroma-reveal"/);
});

test("portrait chroma pointer coordinates stay inside the portrait stage", async () => {
  const { getRelativePointerPosition, isPointerInsideElement } = await vite.ssrLoadModule(
    "/src/components/PortraitChromaReveal.jsx",
  );
  const element = {
    getBoundingClientRect: () => ({ left: 20, top: 40, width: 200, height: 400 }),
  };

  assert.deepEqual(
    getRelativePointerPosition({ clientX: 120, clientY: 240 }, element),
    { x: 50, y: 50 },
  );
  assert.deepEqual(
    getRelativePointerPosition({ clientX: -100, clientY: 1000 }, element),
    { x: 0, y: 100 },
  );
  assert.equal(isPointerInsideElement({ clientX: 120, clientY: 240 }, element), true);
  assert.equal(isPointerInsideElement({ clientX: 10, clientY: 240 }, element), false);
});

test("portrait chroma reveal is fine-pointer gated and adds no card border", () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "EditorialAbout.css"),
    "utf8",
  );

  assert.match(css, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
  assert.match(css, /@supports\s*\(mask-image:\s*radial-gradient\(#000,\s*transparent\)\)/);
  assert.match(css, /\.portrait-chroma-reveal__color\s*\{[^}]*opacity:\s*0/s);
  assert.match(css, /\.portrait-chroma-reveal\.is-active\s+\.portrait-chroma-reveal__color\s*\{[^}]*opacity:\s*1/s);
  assert.doesNotMatch(css, /portrait-chroma-reveal[^\{]*\{[^}]*border:/s);
});

test("removed color backgrounds and their Three.js dependency do not ship", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
  );
  const appSource = fs.readFileSync(path.join(process.cwd(), "src", "App.jsx"), "utf8");

  assert.equal(packageJson.dependencies.three, undefined);
  assert.doesNotMatch(appSource, /LiquidEther|HomeLiquidBackground|SoftAurora/);
  for (const fileName of [
    "LiquidEther.jsx",
    "LiquidEther.css",
    "HomeLiquidBackground.jsx",
    "SoftAurora.jsx",
    "SoftAurora.css",
  ]) {
    assert.equal(fs.existsSync(path.join(process.cwd(), "src", "components", fileName)), false);
  }
});

test("sidebar navigation data exposes grouped site and project shortcuts", async () => {
  const { sidebarMenuGroups, sidebarStatusText } = await import(
    "../src/data/sidebarMenu.js"
  );

  assert.deepEqual(
    sidebarMenuGroups.map((group) => `${group.title} / ${group.titleZh}`),
    [
      "HOME / 首页",
      "ABOUT / 关于",
      "PROJECTS / 作品",
      "PROCESS / 过程",
      "CONTACT / 联系",
    ],
  );
  assert.deepEqual(
    sidebarMenuGroups.flatMap((group) => group.children)
      .filter((item) => item.link)
      .map((item) => item.link),
    [
      "/#top",
      "/#about",
      "/#about-details",
      "/work/consumer",
      "/work/enterprise",
      "/work/campaign",
      "/#process",
      "/#contact",
    ],
  );
  const aiProduct = sidebarMenuGroups
    .flatMap((group) => group.children)
    .find((item) => item.label === "AI 产品探索 · 即将上线");
  assert.deepEqual(aiProduct, {
    label: "AI 产品探索 · 即将上线",
    disabled: true,
  });
  assert.equal(sidebarStatusText, "OPEN TO WORK · UI/UX · AI PRODUCT");
});

test("StaggeredMenu renders grouped links, disabled items and its bee treatment", async () => {
  const { default: StaggeredMenu } = await vite.ssrLoadModule(
    "/src/components/StaggeredMenu.jsx",
  );
  const html = renderToStaticMarkup(
    React.createElement(StaggeredMenu, {
      groups: [
        {
          title: "PROJECTS",
          titleZh: "作品",
          link: "/#work",
          ariaLabel: "查看作品项目",
          children: [
            { label: "健康管家", link: "/work/consumer" },
            { label: "AI 产品探索 · 即将上线", disabled: true },
          ],
        },
      ],
      statusText: "OPEN TO WORK · UI/UX · AI PRODUCT",
    }),
  );

  assert.match(html, /class="staggered-menu-root"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="staggered-menu-panel"/);
  assert.match(html, /PROJECTS[\s\S]*作品/);
  assert.match(html, /href="\/work\/consumer"/);
  assert.match(html, /aria-disabled="true"/);
  assert.doesNotMatch(html, /href="\/work\/ai-product"/);
  assert.match(html, /OPEN TO WORK · UI\/UX · AI PRODUCT/);
  assert.match(html, /src="\/hero\/design-in-bloom\/bee\.png"/);
  assert.equal((html.match(/class="sm-heading-bee"/g) ?? []).length, 1);
});

test("every public page exposes the same grouped sidebar menu", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");

  for (const route of ["/", "/work/consumer", "/work/enterprise", "/work/campaign"]) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: route }));

    assert.equal((html.match(/class="staggered-menu-root/g) ?? []).length, 1, route);
    assert.equal((html.match(/class="sm-menu-group"/g) ?? []).length, 5, route);
    assert.match(html, /href="\/work\/consumer"/, route);
    assert.match(html, /href="\/work\/enterprise"/, route);
    assert.match(html, /href="\/work\/campaign"/, route);
    assert.match(html, /aria-disabled="true"/, route);
    assert.doesNotMatch(html, /href="\/work\/ai-product"/, route);
  }
});

test("every public navigation exposes one shared adaptive brand contrast", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");

  for (const route of ["/", "/work/consumer", "/work/enterprise", "/work/campaign"]) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: route }));

    assert.equal((html.match(/class="nav-brand"/g) ?? []).length, 1, route);
    assert.match(html, /<header[^>]*data-brand-contrast="light"/, route);
    assert.match(html, /class="sm-menu-trigger sm-trigger-inherit"/, route);
    assert.match(
      html,
      /class="nav-brand"[\s\S]*class="sm-menu-trigger sm-trigger-inherit"[\s\S]*class="wordmark"/,
      route,
    );
  }
});

test("every public page shares one viewport ClickSpark layer", async () => {
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");

  for (const route of ["/", "/work/consumer", "/work/enterprise", "/work/campaign"]) {
    const html = renderToStaticMarkup(React.createElement(App, { initialPath: route }));

    assert.equal((html.match(/data-click-spark="true"/g) ?? []).length, 1, route);
    assert.match(html, /data-spark-count="8"/, route);
    assert.match(html, /data-spark-duration="320"/, route);
  }
});

test("the fixed sidebar is not trapped by a transformed navigation containing block", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(
    styles,
    /\.site-nav:not\(\.site-nav-solid\),\s*\.site-nav-solid\s*\{[^}]*left:\s*max\(calc\(\(100% - 1700px\) \/ 2\),\s*clamp\(22px, 3vw, 58px\)\);[^}]*transform:\s*none;/,
  );
});
