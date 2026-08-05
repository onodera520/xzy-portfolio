export function scrollDisplacement({
  scrollVelocity,
  deltaMs,
  velocity,
  rowIndex,
  direction,
}) {
  if (!deltaMs || !velocity) return 0;

  const rowDirection = rowIndex % 2 === 0 ? -1 : 1;
  const speedFactor = 1 + Math.abs(scrollVelocity) / 1000;

  return rowDirection * direction * velocity * speedFactor * (deltaMs / 1000);
}

export function resolveScrollDirection(scrollVelocity, previousDirection = 1) {
  if (scrollVelocity > 0) return 1;
  if (scrollVelocity < 0) return -1;
  return previousDirection;
}

export function wrapOffset(min, max, value) {
  const range = max - min;
  if (range === 0) return min;

  return ((((value - min) % range) + range) % range) + min;
}
