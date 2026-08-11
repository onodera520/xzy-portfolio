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

test("bee heading corrects a left-facing sprite and holds its last angle at low speed", async () => {
  const { getBeeHeading } = await import("../src/lib/beeSwarm.js");

  assert.equal(getBeeHeading(8, 0, 0.25), Math.PI);
  assert.equal(getBeeHeading(-8, 0, 0.25), Math.PI * 2);
  assert.equal(getBeeHeading(0.0001, 0.0001, 1.234), 1.234);
});

test("bee trails stay short and use no more than five fading samples", async () => {
  const { clampTrailLength, getTrailSampleCount } = await import("../src/lib/beeSwarm.js");

  assert.equal(clampTrailLength(4), 24);
  assert.equal(clampTrailLength(32), 32);
  assert.equal(clampTrailLength(100), 40);
  assert.equal(getTrailSampleCount(24), 3);
  assert.equal(getTrailSampleCount(32), 4);
  assert.equal(getTrailSampleCount(40), 5);
});

test("desktop and mobile swarm counts follow the public component contract", async () => {
  const { getResponsiveBeeCount } = await import("../src/lib/beeSwarm.js");

  assert.equal(getResponsiveBeeCount(1440, 10, 6), 10);
  assert.equal(getResponsiveBeeCount(390, 10, 6), 6);
});

test("the swarm pauses when disabled, offscreen, hidden or reduced-motion is active", async () => {
  const { shouldPauseSwarm } = await import("../src/lib/beeSwarm.js");
  const active = {
    enabled: true,
    inViewport: true,
    documentHidden: false,
    reducedMotion: false,
  };

  assert.equal(shouldPauseSwarm(active), false);
  assert.equal(shouldPauseSwarm({ ...active, enabled: false }), true);
  assert.equal(shouldPauseSwarm({ ...active, inViewport: false }), true);
  assert.equal(shouldPauseSwarm({ ...active, documentHidden: true }), true);
  assert.equal(shouldPauseSwarm({ ...active, reducedMotion: true }), true);
});

test("speed 2.5 maps to the reference swarm travel and steering rates", async () => {
  const { getSwarmMotion } = await import("../src/lib/beeSwarm.js");

  assert.deepEqual(getSwarmMotion(2.5), {
    maxSpeed: 522.5,
    steerRate: 7.375,
    minSpeed: 167.2,
  });
});

test("flower magnet peaks halfway through its radius and releases at the boundary", async () => {
  const { getFlowerMagnetTarget } = await import("../src/lib/beeSwarm.js");
  const center = { x: 500, y: 300 };
  const options = { active: true, radius: 240, maxX: 24, maxY: 18 };

  assert.deepEqual(getFlowerMagnetTarget({ x: 620, y: 300 }, center, options), { x: 24, y: 0 });
  assert.deepEqual(getFlowerMagnetTarget({ x: 500, y: 420 }, center, options), { x: 0, y: 18 });
  assert.deepEqual(getFlowerMagnetTarget({ x: 740, y: 300 }, center, options), { x: 0, y: 0 });
  assert.deepEqual(getFlowerMagnetTarget({ x: 620, y: 300 }, center, { ...options, active: false }), { x: 0, y: 0 });
});

test("pointer tracking stops as soon as the pointer reaches the Design in Bloom boundary", async () => {
  const { isPointerInTrackingZone } = await import("../src/lib/beeSwarm.js");
  const zone = { left: 0, top: 0, right: 1200, bottom: 620 };

  assert.equal(isPointerInTrackingZone({ x: 600, y: 619 }, zone), true);
  assert.equal(isPointerInTrackingZone({ x: 600, y: 620 }, zone), false);
  assert.equal(isPointerInTrackingZone({ x: 600, y: 760 }, zone), false);
});

test("idle bees receive independent time-varying flight samples instead of one shared circle", async () => {
  const { getOrganicFlightSample } = await import("../src/lib/beeSwarm.js");
  const first = getOrganicFlightSample(0, 2, false);
  const neighbor = getOrganicFlightSample(1, 2, false);
  const later = getOrganicFlightSample(0, 7, false);

  assert.notDeepEqual(first, neighbor);
  assert.notDeepEqual(first, later);
  for (const sample of [first, neighbor, later]) {
    assert.ok(sample.radiusScale >= 0.66 && sample.radiusScale <= 1.34);
    assert.ok(sample.verticalScale >= 0.5 && sample.verticalScale <= 0.84);
    assert.ok(Math.abs(sample.angleOffset) <= 0.7);
  }
});

test("pointer flight keeps organic drift but tightens it around the cursor", async () => {
  const { getOrganicFlightSample } = await import("../src/lib/beeSwarm.js");
  const idle = getOrganicFlightSample(3, 4, false);
  const pointer = getOrganicFlightSample(3, 4, true);

  assert.ok(Math.abs(pointer.radiusScale - 1) < Math.abs(idle.radiusScale - 1));
  assert.ok(Math.abs(pointer.angleOffset) < Math.abs(idle.angleOffset));
});

test("the hero renders its resilient flower and bee layers without hiding native content", async () => {
  const { default: BeeSwarmHero } = await vite.ssrLoadModule("/src/components/BeeSwarmHero.jsx");
  const html = renderToStaticMarkup(
    React.createElement(
      BeeSwarmHero,
      {
        flowerSrc: "/hero/design-in-bloom/flower.png",
        beeSrc: "/hero/design-in-bloom/bee.png",
        speed: 2.5,
        pointerSpread: [65, 105],
        magnetRadius: 240,
        magnetStrengthX: 24,
        magnetStrengthY: 18,
        trackingBoundarySelector: ".bloom-hero-copy h1",
      },
      React.createElement("h1", null, "DESIGN IN BLOOM"),
    ),
  );

  assert.match(html, /data-bee-swarm="true"/);
  assert.match(html, /data-desktop-count="10"/);
  assert.match(html, /data-mobile-count="6"/);
  assert.match(html, /data-speed="2\.5"/);
  assert.match(html, /data-magnet-radius="240"/);
  assert.match(html, /data-pointer-spread="65-105"/);
  assert.match(html, /data-tracking-boundary="\.bloom-hero-copy h1"/);
  assert.equal((html.match(/class="bee-swarm__bee"/g) ?? []).length, 10);
  assert.match(html, /class="bee-swarm__trail"/);
  assert.match(html, /src="\/hero\/design-in-bloom\/flower\.png"/);
  assert.match(html, /DESIGN IN BLOOM/);
});

test("generated hero artwork is local PNG with alpha and a 512px bee sprite", () => {
  const flowerPath = path.join(process.cwd(), "public", "hero", "design-in-bloom", "flower.png");
  const beePath = path.join(process.cwd(), "public", "hero", "design-in-bloom", "bee.png");

  for (const assetPath of [flowerPath, beePath]) {
    assert.equal(fs.existsSync(assetPath), true);
    const bytes = fs.readFileSync(assetPath);
    assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG");
    assert.ok([4, 6].includes(bytes[25]), `${assetPath} must include alpha`);
  }

  const beeBytes = fs.readFileSync(beePath);
  assert.equal(beeBytes.readUInt32BE(16), 512);
  assert.ok(beeBytes.readUInt32BE(20) <= 512);
});
