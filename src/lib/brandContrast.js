const VALID_THEMES = new Set(["light", "dark"]);

export function normalizeBrandContrast(value, fallback = "light") {
  if (VALID_THEMES.has(value)) return value;
  return VALID_THEMES.has(fallback) ? fallback : "light";
}

export function resolveBrandContrast(detectedTheme, fixedTheme) {
  return fixedTheme === undefined
    ? normalizeBrandContrast(detectedTheme)
    : normalizeBrandContrast(fixedTheme, detectedTheme);
}

export function selectBrandContrast(regions, sampleY, fallback = "light") {
  let theme = normalizeBrandContrast(undefined, fallback);

  for (const region of regions) {
    if (sampleY >= region.top && sampleY < region.bottom) {
      theme = normalizeBrandContrast(region.theme, theme);
    }
  }

  return theme;
}
