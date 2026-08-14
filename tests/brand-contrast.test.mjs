import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeBrandContrast,
  resolveBrandContrast,
  selectBrandContrast,
} from "../src/lib/brandContrast.js";

test("brand contrast normalizes invalid input to the requested fallback", () => {
  assert.equal(normalizeBrandContrast("light", "dark"), "light");
  assert.equal(normalizeBrandContrast("dark", "light"), "dark");
  assert.equal(normalizeBrandContrast("sepia", "dark"), "dark");
  assert.equal(normalizeBrandContrast(undefined, "sepia"), "light");
});

test("fixed brand contrast overrides detection without changing adaptive pages", () => {
  assert.equal(resolveBrandContrast("dark", "light"), "light");
  assert.equal(resolveBrandContrast("dark"), "dark");
});

test("brand contrast follows the region containing the navigation sample line", () => {
  const regions = [
    { theme: "light", top: 0, bottom: 600 },
    { theme: "dark", top: 600, bottom: 1200 },
  ];

  assert.equal(selectBrandContrast(regions, 120, "dark"), "light");
  assert.equal(selectBrandContrast(regions, 780, "light"), "dark");
});

test("the visually later matching region wins when declared regions overlap", () => {
  const regions = [
    { theme: "light", top: 0, bottom: 900 },
    { theme: "dark", top: 500, bottom: 760 },
  ];

  assert.equal(selectBrandContrast(regions, 640, "light"), "dark");
});

test("a sample line in an undeclared gap uses the page fallback", () => {
  const regions = [
    { theme: "dark", top: 0, bottom: 300 },
    { theme: "light", top: 700, bottom: 1000 },
  ];

  assert.equal(selectBrandContrast(regions, 500, "light"), "light");
  assert.equal(selectBrandContrast(regions, 500, "dark"), "dark");
});
