import assert from "node:assert/strict";
import fs from "node:fs";
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

test("opening bloom storage helpers survive unavailable session storage", async () => {
  const {
    OPENING_BLOOM_STORAGE_KEY,
    hasOpeningBloomPlayed,
    markOpeningBloomPlayed,
    recordOpeningBloomDocumentPath,
    shouldPlayOpeningBloom,
  } = await import("../src/lib/openingBloom.js");
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };

  assert.equal(hasOpeningBloomPlayed(storage, OPENING_BLOOM_STORAGE_KEY), false);
  assert.equal(markOpeningBloomPlayed(storage, OPENING_BLOOM_STORAGE_KEY), true);
  assert.equal(hasOpeningBloomPlayed(storage, OPENING_BLOOM_STORAGE_KEY), true);
  assert.equal(shouldPlayOpeningBloom(storage, null, "/", OPENING_BLOOM_STORAGE_KEY), false);
  assert.equal(recordOpeningBloomDocumentPath(storage, "/", OPENING_BLOOM_STORAGE_KEY), null);
  assert.equal(recordOpeningBloomDocumentPath(storage, "/", OPENING_BLOOM_STORAGE_KEY), "/");
  assert.equal(shouldPlayOpeningBloom(storage, "/", "/", OPENING_BLOOM_STORAGE_KEY), true);
  assert.equal(recordOpeningBloomDocumentPath(storage, "/work/consumer", OPENING_BLOOM_STORAGE_KEY), "/");
  assert.equal(recordOpeningBloomDocumentPath(storage, "/", OPENING_BLOOM_STORAGE_KEY), "/work/consumer");
  assert.equal(shouldPlayOpeningBloom(storage, "/work/consumer", "/", OPENING_BLOOM_STORAGE_KEY), false);

  const blocked = {
    getItem: () => { throw new Error("blocked"); },
    setItem: () => { throw new Error("blocked"); },
  };
  assert.equal(hasOpeningBloomPlayed(blocked), false);
  assert.equal(markOpeningBloomPlayed(blocked), false);
  assert.equal(shouldPlayOpeningBloom(blocked, null, "/"), true);
  assert.equal(recordOpeningBloomDocumentPath(blocked, "/"), null);
});

test("opening bloom uses one uninterrupted reveal phase and never restarts", async () => {
  const {
    getNextOpeningBloomPhase,
    isOpeningBloomActivationKey,
  } = await import("../src/lib/openingBloom.js");

  assert.equal(isOpeningBloomActivationKey("Enter"), true);
  assert.equal(isOpeningBloomActivationKey(" "), true);
  assert.equal(isOpeningBloomActivationKey("Escape"), false);
  assert.equal(getNextOpeningBloomPhase("idle", "arrive"), "arriving");
  assert.equal(getNextOpeningBloomPhase("arriving", "ready"), "ready");
  assert.equal(getNextOpeningBloomPhase("ready", "activate"), "revealing");
  assert.equal(getNextOpeningBloomPhase("revealing", "activate"), "revealing");
  assert.equal(getNextOpeningBloomPhase("revealing", "finish"), "complete");
  assert.equal(getNextOpeningBloomPhase("idle", "finish"), "complete");
});

test("OpeningBloom exposes one accessible flower without a second reveal layer", async () => {
  const { default: OpeningBloom } = await vite.ssrLoadModule("/src/components/OpeningBloom.jsx");
  const html = renderToStaticMarkup(React.createElement(OpeningBloom, {
    flowerSrc: "/hero/design-in-bloom/flower-sprite.png",
  }));

  assert.match(html, /data-opening-bloom="true"/);
  assert.match(html, /data-opening-phase="idle"/);
  assert.match(html, /aria-label="点击花朵进入 XUE STUDIO"/);
  assert.match(html, /<img[^>]*src="\/hero\/design-in-bloom\/flower-sprite\.png"/);
  assert.doesNotMatch(html, /data-opening-mask="true"/);
});

test("opening bloom CSS contains the reveal and reduced-motion paths", () => {
  const css = fs.readFileSync(new URL("../src/components/OpeningBloom.css", import.meta.url), "utf8");
  const component = fs.readFileSync(new URL("../src/components/OpeningBloom.jsx", import.meta.url), "utf8");

  assert.match(css, /@keyframes opening-flower-arrive/);
  assert.match(css, /@keyframes opening-flower-reveal/);
  assert.match(css, /@keyframes opening-overlay-reveal/);
  assert.match(css, /data-opening-phase="revealing"/);
  assert.match(css, /opening-flower-reveal 1600ms/);
  assert.match(css, /opening-overlay-reveal 1600ms/);
  assert.match(css, /transform:\s*scale\(12\)/);
  assert.match(component, /REVEAL_DURATION_MS = 1600/);
  assert.doesNotMatch(css, /opening-mask-reveal/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /transition:\s*all/);
});

test("the page hides its scrollbar without reserving empty gutter space", () => {
  const globalCss = fs.readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(globalCss, /html,\s*body\s*\{[^}]*scrollbar-width:\s*none/s);
  assert.match(globalCss, /html::-webkit-scrollbar,\s*body::-webkit-scrollbar\s*\{[^}]*display:\s*none/s);
  assert.doesNotMatch(globalCss, /scrollbar-gutter:\s*stable/);
});
