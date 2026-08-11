import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getEntranceMotion,
  shouldRunContinuousMotion,
} from "../src/lib/motionActivity.js";

test("continuous motion runs only while it is visible and motion is allowed", () => {
  const active = {
    enabled: true,
    inViewport: true,
    documentHidden: false,
    reducedMotion: false,
  };

  assert.equal(shouldRunContinuousMotion(active), true);
  assert.equal(shouldRunContinuousMotion({ ...active, enabled: false }), false);
  assert.equal(shouldRunContinuousMotion({ ...active, inViewport: false }), false);
  assert.equal(shouldRunContinuousMotion({ ...active, documentHidden: true }), false);
  assert.equal(shouldRunContinuousMotion({ ...active, reducedMotion: true }), false);
});

test("homepage entrances use restrained movement and a reduced-motion cross-fade", () => {
  assert.deepEqual(getEntranceMotion(), {
    duration: 0.4,
    stagger: 0.05,
    y: 12,
  });
  assert.deepEqual(getEntranceMotion({ hero: true }), {
    duration: 0.5,
    stagger: 0.032,
    y: 14,
  });
  assert.deepEqual(getEntranceMotion({ reducedMotion: true }), {
    duration: 0.18,
    stagger: 0,
    y: 0,
  });
});
