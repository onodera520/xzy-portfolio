import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { inflateSync } from "node:zlib";

const assetPath = path.join(
  process.cwd(),
  "public",
  "cursors",
  "interactive-hand-cursor.png",
);

function paeth(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function parseRgbaPng(filePath) {
  const bytes = fs.readFileSync(filePath);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = -1;
  const idat = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    offset += length + 12;
  }
  assert.equal(colorType, 6);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);
  for (let row = 0; row < height; row += 1) {
    const source = row * (stride + 1);
    const filter = raw[source];
    for (let column = 0; column < stride; column += 1) {
      const target = row * stride + column;
      const left = column >= 4 ? pixels[target - 4] : 0;
      const above = row ? pixels[target - stride] : 0;
      const upperLeft = row && column >= 4 ? pixels[target - stride - 4] : 0;
      const prediction = filter === 1
        ? left
        : filter === 2
          ? above
          : filter === 3
            ? Math.floor((left + above) / 2)
            : filter === 4
              ? paeth(left, above, upperLeft)
              : 0;
      pixels[target] = (raw[source + 1 + column] + prediction) & 255;
    }
  }
  return { width, height, pixels };
}

test("the interactive hand cursor is a transparent 32px local PNG", () => {
  assert.equal(fs.existsSync(assetPath), true, "interactive cursor asset should exist");
  const { width, height, pixels } = parseRgbaPng(assetPath);
  const alpha = [];
  for (let index = 3; index < pixels.length; index += 4) alpha.push(pixels[index]);
  assert.equal(width, 32);
  assert.equal(height, 32);
  assert.ok(alpha.some((value) => value === 0));
  assert.ok(alpha.some((value) => value > 0));
});

test("enabled interactive elements use the hand while semantic overrides remain", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");
  assert.match(
    styles,
    /--interactive-cursor:\s*url\("\/cursors\/interactive-hand-cursor\.png"\)\s+10\s+7,\s*pointer/,
  );
  const interactiveRule = /a\[href\][\s\S]*?button:not\(\[disabled\]\)[\s\S]*?input\[type="range"\][\s\S]*?\[role="button"\][\s\S]*?\.ag-panel\s*\{[^}]*cursor:\s*var\(--interactive-cursor\)\s*!important;/;
  assert.match(styles, interactiveRule);
  assert.match(
    styles,
    /:is\([^}]*a\[href\][^}]*button:not\(\[disabled\]\)[^}]*\.ag-panel[^}]*\)\s*>?\s*\*\s*\{[^}]*cursor:\s*var\(--interactive-cursor\)\s*!important;/s,
    "interactive descendants such as button labels, menu lines and card overlays should inherit the hand cursor",
  );
  const interactiveIndex = styles.indexOf("cursor: var(--interactive-cursor) !important;");
  const textIndex = styles.indexOf("cursor: text !important;", interactiveIndex);
  const disabledIndex = styles.indexOf("cursor: not-allowed !important;", interactiveIndex);
  assert.ok(interactiveIndex >= 0 && textIndex > interactiveIndex && disabledIndex > interactiveIndex);
  assert.match(
    styles,
    /\[disabled\][\s\S]*?\[aria-disabled="true"\][\s\S]*?\[disabled\]\s+\*[\s\S]*?\[aria-disabled="true"\]\s+\*\s*\{[^}]*cursor:\s*not-allowed\s*!important;/,
  );
});
