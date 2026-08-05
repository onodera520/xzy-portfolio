import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("local development server binds to the shared 127.0.0.1 URL", () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  assert.equal(packageJson.scripts.dev, "vite --host 127.0.0.1 --port 3000");
  assert.equal(packageJson.scripts.preview, "vite preview --host 127.0.0.1 --port 3000");
});

test("Vercel serves client-side portfolio routes through the SPA entry", () => {
  const vercelConfig = JSON.parse(fs.readFileSync("vercel.json", "utf8"));

  assert.deepEqual(vercelConfig.rewrites, [
    {
      source: "/work/:path*",
      destination: "/index.html",
    },
  ]);
});
