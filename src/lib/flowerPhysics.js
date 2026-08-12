const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function shouldSuppressFlowerPointerFocus(pointerType = "") {
  return pointerType === "mouse";
}

function seededRandom(seed = 1) {
  let value = (Number(seed) || 1) >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function normalizeFlowerConfig(config = {}) {
  return {
    burstCount: clamp(Math.round(config.burstCount ?? 8), 1, 30),
    mobileBurstCount: clamp(Math.round(config.mobileBurstCount ?? 5), 1, 30),
    maxFlowers: clamp(Math.round(config.maxFlowers ?? 30), 1, 30),
    settleMs: Math.max(0, Math.round(config.settleMs ?? 10000)),
    fadeMs: Math.max(1, Math.round(config.fadeMs ?? 800)),
  };
}

export function getCrownRegion(rect = {}) {
  const left = Number(rect.left) || 0;
  const top = Number(rect.top) || 0;
  const width = Math.max(0, Number(rect.width) || 0);
  const height = Math.max(0, Number(rect.height) || 0);
  return {
    left: left + (width * 0.2),
    top: top + (height * 0.18),
    width: width * 0.6,
    height: height * 0.3,
  };
}

export function getRelativeFloorY(rootRect = {}, floorRect) {
  const rootTop = Number(rootRect.top) || 0;
  const fallback = Math.max(0, Number(rootRect.height) || 0);
  return floorRect && Number.isFinite(floorRect.top)
    ? Math.max(0, floorRect.top - rootTop)
    : fallback;
}

export function getFlowerCollisionRadius(visualRadius = 0) {
  return Math.max(0, Number(visualRadius) || 0) * Math.SQRT2;
}

export function createCrownBurst({ flowerRect, crownRegion, count = 8, seed = 1, mobile = false } = {}) {
  const region = crownRegion ?? getCrownRegion(flowerRect);
  const random = seededRandom(seed);
  const safeCount = clamp(Math.round(count), 1, 30);
  const minRadius = mobile ? 12 : 14;
  const maxRadius = mobile ? 19 : 23;
  return Array.from({ length: safeCount }, (_, index) => {
    const normalized = safeCount === 1 ? 0.5 : index / (safeCount - 1);
    const fan = (normalized * 2) - 1;
    return {
      x: region.left + (region.width * (0.08 + random() * 0.84)),
      y: region.top + (region.height * (0.08 + random() * 0.84)),
      radius: minRadius + (random() * (maxRadius - minRadius)),
      velocity: {
        x: (fan * 4.2) + ((random() - 0.5) * 1.4),
        y: -(5.8 + random() * 2.6),
      },
      angularVelocity: (random() - 0.5) * 0.09,
      angle: (random() - 0.5) * 0.5,
    };
  });
}

export function isFlowerSettled(sample = {}, thresholds = {}) {
  if (sample.dragging) return false;
  return Math.abs(Number(sample.speed) || 0) <= (thresholds.speed ?? 0.12)
    && Math.abs(Number(sample.angularSpeed) || 0) <= (thresholds.angularSpeed ?? 0.025);
}

export function updateFlowerRestState(record, sample = {}, now = 0, stableDelay = 650) {
  const settledNow = isFlowerSettled(sample);
  if (settledNow && !Number.isFinite(record.settledAt)) {
    record.stableSince ??= now;
    if (now - record.stableSince >= stableDelay) record.settledAt = now;
  } else if (!settledNow) {
    record.stableSince = null;
  }
  return Number.isFinite(record.settledAt);
}

export function getFlowerLifecycle(state = {}, now = 0, settleDelay = 10000, fadeDuration = 800) {
  if (!Number.isFinite(state.settledAt)) return "moving";
  const elapsed = now - state.settledAt;
  if (elapsed < settleDelay) return "settled";
  if (elapsed < settleDelay + fadeDuration) return "fading";
  return "expired";
}

export function assignBeesToFlowers(bees = [], flowers = [], previousAssignments = new Map(), limit = 10) {
  const safeLimit = Math.max(0, Math.min(Math.round(limit), bees.length));
  const flowerById = new Map(flowers.map((flower) => [flower.id, flower]));
  const result = new Map();
  const assignedFlowers = new Set();
  const availableBees = bees.slice(0, safeLimit);

  flowers.filter((flower) => flower.dragging && !flower.fading).forEach((flower) => {
    const nearestBee = availableBees
      .filter((bee) => !result.has(bee.id))
      .sort((first, second) => (
        Math.hypot(first.x - flower.x, first.y - flower.y)
        - Math.hypot(second.x - flower.x, second.y - flower.y)
      ))[0];
    if (nearestBee) {
      result.set(nearestBee.id, flower.id);
      assignedFlowers.add(flower.id);
    }
  });

  availableBees.forEach((bee) => {
    if (result.has(bee.id)) return;
    const previousId = previousAssignments.get(bee.id);
    const flower = flowerById.get(previousId);
    if (flower && !flower.fading && !assignedFlowers.has(flower.id) && (flower.settled || flower.dragging)) {
      result.set(bee.id, flower.id);
      assignedFlowers.add(flower.id);
    }
  });

  availableBees.forEach((bee) => {
    if (result.has(bee.id)) return;
    const nearest = flowers
      .filter((flower) => (flower.settled || flower.dragging) && !flower.fading && !assignedFlowers.has(flower.id))
      .sort((first, second) => (
        Math.hypot(bee.x - first.x, bee.y - first.y)
        - Math.hypot(bee.x - second.x, bee.y - second.y)
      ))[0];
    if (nearest) {
      result.set(bee.id, nearest.id);
      assignedFlowers.add(nearest.id);
    }
  });
  return result;
}
