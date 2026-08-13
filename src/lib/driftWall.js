export function buildDriftWallColumns(
  images = [],
  columnCount = 5,
  itemsPerColumn = 4,
  bleedColumns = 0,
) {
  const totalColumns = columnCount + Math.max(0, bleedColumns);
  if (images.length === 0 || totalColumns <= 0 || itemsPerColumn <= 0) return [];

  return Array.from({ length: totalColumns }, (_, columnIndex) => (
    Array.from({ length: Math.min(itemsPerColumn, images.length) }, (_, imageIndex) => (
      images[(columnIndex * 3 + imageIndex) % images.length]
    ))
  ));
}

export function resolveDriftWallCopyCount({ containerHeight = 0, sequenceHeight = 0 } = {}) {
  if (!containerHeight || !sequenceHeight) return 3;
  return Math.max(3, Math.ceil((containerHeight * 1.8) / sequenceHeight) + 1);
}

export function resolveDriftWallActiveId(element) {
  const tile = element?.closest?.("[data-drift-tile]");
  return tile?.dataset?.driftTile ?? null;
}

export function resolveDriftWallActiveColumn(activeId) {
  if (typeof activeId !== "string") return null;
  const columnIndex = Number(activeId.split("-", 1)[0]);
  return Number.isInteger(columnIndex) && columnIndex >= 0 ? columnIndex : null;
}

export function shouldAdvanceDriftColumn(activeColumn, columnIndex, pauseOnHover = true) {
  return !pauseOnHover || activeColumn === null || activeColumn !== columnIndex;
}

export function resolveDriftWallTileSize() {
  return { width: 264, height: 169.4 };
}

export function resolveDriftWallTransform({
  pointerX = 0,
  pointerY = 0,
  tilt = 20,
  turn = -5,
  roll = 7,
  depth = 130,
  parallax = 1,
} = {}) {
  const rotateX = tilt + pointerY * 8 * parallax;
  const rotateY = turn + pointerX * 8 * parallax;

  return `translate3d(-50%, -50%, -${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${roll}deg)`;
}
