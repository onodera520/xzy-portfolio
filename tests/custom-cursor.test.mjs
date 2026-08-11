import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { inflateSync } from "node:zlib";

const cursorPath = path.join(
  process.cwd(),
  "public",
  "cursors",
  "floral-bee-cursor.png",
);

function paethPredictor(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function readRgbaPng(filePath) {
  const bytes = fs.readFileSync(filePath);
  assert.deepEqual(
    [...bytes.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    "cursor should be a PNG",
  );

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = -1;
  const compressed = [];

  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === "IDAT") {
      compressed.push(data);
    }
    offset += length + 12;
  }

  assert.equal(colorType, 6, "cursor should use RGBA color data");
  const raw = inflateSync(Buffer.concat(compressed));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);

  for (let row = 0; row < height; row += 1) {
    const sourceOffset = row * (stride + 1);
    const filter = raw[sourceOffset];
    for (let column = 0; column < stride; column += 1) {
      const rawValue = raw[sourceOffset + 1 + column];
      const targetOffset = row * stride + column;
      const left = column >= 4 ? pixels[targetOffset - 4] : 0;
      const above = row > 0 ? pixels[targetOffset - stride] : 0;
      const upperLeft = row > 0 && column >= 4
        ? pixels[targetOffset - stride - 4]
        : 0;
      const predictor = filter === 1
        ? left
        : filter === 2
          ? above
          : filter === 3
            ? Math.floor((left + above) / 2)
            : filter === 4
              ? paethPredictor(left, above, upperLeft)
              : 0;
      pixels[targetOffset] = (rawValue + predictor) & 255;
    }
  }

  return { width, height, pixels };
}

test("the floral bee cursor is a transparent 32px local PNG", () => {
  assert.equal(fs.existsSync(cursorPath), true, "cursor asset should exist");
  const { width, height, pixels } = readRgbaPng(cursorPath);
  const alpha = [];
  for (let index = 3; index < pixels.length; index += 4) alpha.push(pixels[index]);

  assert.equal(width, 32);
  assert.equal(height, 32);
  assert.ok(alpha.some((value) => value === 0), "cursor should contain transparent pixels");
  assert.ok(alpha.some((value) => value > 0), "cursor should contain visible artwork");
});

test("fine pointers use the custom cursor without replacing semantic cursors", () => {
  const styles = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.match(styles, /--site-cursor:\s*url\("\/cursors\/floral-bee-cursor\.png"\)\s+3\s+2,\s*auto/);
  assert.match(styles, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
  assert.match(styles, /input[^}]*textarea[^}]*contenteditable[^}]*\{[^}]*cursor:\s*text/s);
  assert.match(styles, /disabled[^}]*aria-disabled[^}]*\{[^}]*cursor:\s*not-allowed/s);
});
