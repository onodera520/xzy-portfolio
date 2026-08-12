export function selectBeeScrambleTargets(
  glyphs,
  {
    radius = 120,
    minCount = 2,
    maxCount = 4,
    randomValue = Math.random(),
    excludedIndices = new Set(),
    activeLimit = Number.POSITIVE_INFINITY,
  } = {},
) {
  const safeMin = Math.max(1, Math.round(minCount));
  const safeMax = Math.max(safeMin, Math.round(maxCount));
  const normalizedRandom = Math.min(0.999999, Math.max(0, Number.isFinite(randomValue) ? randomValue : 0));
  const requestedCount = safeMin + Math.floor(normalizedRandom * (safeMax - safeMin + 1));
  const remainingCount = Number.isFinite(activeLimit)
    ? Math.max(0, Math.round(activeLimit) - excludedIndices.size)
    : requestedCount;

  return glyphs
    .filter((glyph) => (
      Number.isFinite(glyph?.distance)
      && glyph.distance < radius
      && !excludedIndices.has(glyph.index)
    ))
    .sort((first, second) => first.distance - second.distance)
    .slice(0, Math.min(requestedCount, remainingCount))
    .map((glyph) => glyph.index);
}

export function getBeeScrambleSprite(order) {
  return Math.abs(Math.round(order)) % 2 === 0 ? "flower" : "bee";
}
