import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const styles = fs.readFileSync(
  path.join(process.cwd(), "src", "components", "ScrollVelocity.css"),
  "utf8",
);

test("the two-row marquee uses the approved compact desktop scale", () => {
  assert.match(
    styles,
    /\.scroll-velocity-copy\s*\{[^}]*padding:\s*0\.12em 0\.3em 0\.15em 0;[^}]*font-size:\s*clamp\(2rem, 3\.8vw, 4\.5rem\);/s,
  );
});

test("the two-row marquee uses the approved compact mobile scale", () => {
  assert.match(
    styles,
    /@media\s*\(max-width:\s*767px\)\s*\{[\s\S]*?\.scroll-velocity-copy\s*\{[^}]*font-size:\s*clamp\(1\.5rem, 7\.2vw, 2\.4rem\);/,
  );
});
