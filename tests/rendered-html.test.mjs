import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("homepage presents the portfolio path instead of the starter", async () => {
  const response = await render();
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /XZY/);
  assert.match(html, /把复杂问题，设计成清晰体验/);
  assert.match(html, /精选项目/);
  assert.match(html, /C 端产品/);
  assert.match(html, /B 端产品/);
  assert.match(html, /H5 运营活动/);
  assert.match(html, /AI 与设计/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

for (const [pathname, expected] of [
  ["/work/consumer", "C 端体验项目"],
  ["/work/enterprise", "B 端工作台项目"],
  ["/work/campaign", "H5 运营活动项目"],
]) {
  test(`${pathname} renders a structured case study`, async () => {
    const response = await render(pathname);
    assert.equal(response.status, 200);

    const html = await response.text();
    assert.match(html, new RegExp(expected));
    assert.match(html, /项目背景/);
    assert.match(html, /设计挑战/);
    assert.match(html, /研究与洞察/);
    assert.match(html, /关键决策/);
    assert.match(html, /验证与反思/);
    assert.match(html, /示例内容，等待替换为真实项目材料/);
  });
}

test("AI page states a considered design position", async () => {
  const response = await render("/ai");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /AI 与设计实践/);
  assert.match(html, /放大提问、探索与验证/);
  assert.match(html, /我的边界/);
});

test("about page provides job-search context and contact placeholder", async () => {
  const response = await render("/about");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /关于 XZY/);
  assert.match(html, /UI\/UX 设计研究生/);
  assert.match(html, /邮箱地址待替换/);
});
