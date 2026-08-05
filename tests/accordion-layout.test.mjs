import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateAccordionLayout,
  shouldShowAccordionLabel,
} from "../src/lib/accordionLayout.js";

test("a wide active panel is exactly 16:9 and the remaining width is shared", () => {
  const layout = calculateAccordionLayout({
    width: 1700,
    height: 520,
    count: 4,
    gap: 14,
    activeIndex: 1,
  });

  assert.equal(layout.galleryHeight, 520);
  assert.ok(Math.abs(layout.activeWidth - 924.4444444444445) < 0.000001);
  assert.ok(Math.abs(layout.collapsedWidth - 244.5185185185185) < 0.000001);
  assert.ok(Math.abs(layout.panelWidths[0] - 244.5185185185185) < 0.000001);
  assert.ok(Math.abs(layout.panelWidths[1] - 924.4444444444445) < 0.000001);
  assert.ok(Math.abs(layout.panelWidths[2] - 244.5185185185185) < 0.000001);
  assert.ok(Math.abs(layout.panelWidths[3] - 244.5185185185185) < 0.000001);
});

test("a narrow desktop gallery lowers its height while preserving the active ratio", () => {
  const layout = calculateAccordionLayout({
    width: 960,
    height: 520,
    count: 4,
    gap: 14,
    activeIndex: 0,
  });

  assert.equal(layout.galleryHeight, 394.875);
  assert.equal(layout.activeWidth, 702);
  assert.equal(layout.collapsedWidth, 72);
  assert.deepEqual(layout.panelWidths, [702, 72, 72, 72]);
});

test("idle panels remain equal while reserving a responsive 16:9 gallery height", () => {
  const layout = calculateAccordionLayout({
    width: 960,
    height: 520,
    count: 4,
    gap: 14,
    activeIndex: null,
  });

  assert.equal(layout.galleryHeight, 394.875);
  assert.deepEqual(layout.panelWidths, [229.5, 229.5, 229.5, 229.5]);
});

test("only an insufficient compressed panel hides its label", () => {
  assert.equal(shouldShowAccordionLabel({ hasActive: false, isActive: false, panelWidth: 80, contentWidth: 180 }), true);
  assert.equal(shouldShowAccordionLabel({ hasActive: true, isActive: true, panelWidth: 80, contentWidth: 180 }), true);
  assert.equal(shouldShowAccordionLabel({ hasActive: true, isActive: false, panelWidth: 180, contentWidth: 120 }), false);
  assert.equal(shouldShowAccordionLabel({ hasActive: true, isActive: false, panelWidth: 200, contentWidth: 120 }), true);
});
