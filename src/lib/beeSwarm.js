const MIN_HEADING_SPEED = 0.001;

export function getBeeHeading(vx, vy, lastAngle = 0) {
  if (Math.hypot(vx, vy) < MIN_HEADING_SPEED) return lastAngle;
  return Math.atan2(vy, vx) + Math.PI;
}

export function clampTrailLength(value) {
  const numeric = Number.isFinite(value) ? value : 32;
  return Math.min(40, Math.max(24, numeric));
}

export function getTrailSampleCount(trailLength) {
  const clamped = clampTrailLength(trailLength);
  return Math.min(5, Math.max(3, Math.round((clamped - 24) / 8) + 3));
}

export function getResponsiveBeeCount(width, desktopCount = 10, mobileCount = 6) {
  return width <= 767 ? mobileCount : desktopCount;
}

export function shouldPauseSwarm({ enabled, inViewport, documentHidden, reducedMotion }) {
  return !enabled || !inViewport || documentHidden || reducedMotion;
}

export function getSwarmMotion(speed = 2.5) {
  const safeSpeed = Math.min(10, Math.max(0.1, Number.isFinite(speed) ? speed : 2.5));
  const maxSpeed = 110 + (safeSpeed * 165);
  const steerRate = 4.5 + (safeSpeed * 1.15);

  return {
    maxSpeed,
    steerRate,
    minSpeed: Number((maxSpeed * 0.32).toFixed(3)),
  };
}

export function getFlowerMagnetTarget(
  pointer,
  flowerCenter,
  { active = true, radius = 240, maxX = 24, maxY = 18 } = {},
) {
  if (!active || !pointer || !flowerCenter) return { x: 0, y: 0 };

  const safeRadius = Math.max(1, radius);
  const dx = pointer.x - flowerCenter.x;
  const dy = pointer.y - flowerCenter.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 0.001 || distance >= safeRadius) return { x: 0, y: 0 };

  const normalizedDistance = distance / safeRadius;
  const influence = Math.sin(Math.PI * normalizedDistance) ** 2;
  return {
    x: (dx / distance) * Math.max(0, maxX) * influence,
    y: (dy / distance) * Math.max(0, maxY) * influence,
  };
}

export function isPointerInTrackingZone(pointer, zone) {
  if (!pointer || !zone) return false;
  return pointer.x >= zone.left
    && pointer.x < zone.right
    && pointer.y >= zone.top
    && pointer.y < zone.bottom;
}

export function getOrganicFlightSample(index, elapsedSeconds, pointerActive = false) {
  const time = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
  const seed = Number.isFinite(index) ? index : 0;
  const amplitude = pointerActive ? 0.35 : 1;
  const radiusWave = (Math.sin((time * 0.73) + (seed * 1.91)) * 0.22)
    + (Math.sin((time * 0.31) + (seed * 2.73)) * 0.11);
  const angleWave = (Math.sin((time * 0.47) + (seed * 0.83)) * 0.45)
    + (Math.sin((time * 0.19) + (seed * 2.17)) * 0.18);
  const verticalBase = 0.56 + ((Math.abs(seed) % 4) * 0.07);

  return {
    radiusScale: 1 + (radiusWave * amplitude),
    verticalScale: verticalBase + (Math.sin((time * 0.41) + (seed * 1.37)) * 0.04),
    angleOffset: angleWave * amplitude,
    turnBias: Math.sin((time * 0.23) + (seed * 2.21)),
  };
}

export function createSeededBee(index, center, spread) {
  const minRadius = spread[0];
  const maxRadius = spread[1];
  const ratio = ((index * 0.61803398875) % 1);
  const angle = (index / 10) * Math.PI * 2 + (index % 3) * 0.23;
  const radius = minRadius + ((maxRadius - minRadius) * ratio);

  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius * 0.62,
    vx: 0,
    vy: 0,
    angle: Math.PI,
    radius,
    direction: index % 2 === 0 ? 1 : -1,
    history: [],
  };
}
