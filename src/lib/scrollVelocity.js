export function scrollDisplacement({
  scrollVelocity,
  deltaMs,
  velocity,
  rowIndex,
  direction,
}) {
  if (!deltaMs) return 0;

  const rowDirection = rowIndex % 2 === 0 ? -1 : 1;
  const seconds = deltaMs / 1000;
  const idleDistance = Math.abs(velocity) * seconds;
  const scrollDistance = Math.abs(scrollVelocity) * seconds;

  return rowDirection * direction * (idleDistance + scrollDistance);
}

export function verticalScrollDisplacement({
  scrollVelocity,
  deltaMs,
  velocity,
  columnIndex,
  direction,
}) {
  if (!deltaMs) return 0;

  const columnDirection = columnIndex % 2 === 0 ? -1 : 1;
  const seconds = deltaMs / 1000;
  const idleDistance = Math.abs(velocity) * seconds;
  const scrollDistance = Math.abs(scrollVelocity) * seconds;

  return columnDirection * direction * (idleDistance + scrollDistance);
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
