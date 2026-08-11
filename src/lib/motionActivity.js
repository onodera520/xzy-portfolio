export function shouldRunContinuousMotion({
  enabled = true,
  inViewport = true,
  documentHidden = false,
  reducedMotion = false,
} = {}) {
  return enabled && inViewport && !documentHidden && !reducedMotion;
}

export function getEntranceMotion({ hero = false, reducedMotion = false } = {}) {
  if (reducedMotion) {
    return { duration: 0.18, stagger: 0, y: 0 };
  }

  return hero
    ? { duration: 0.5, stagger: 0.032, y: 14 }
    : { duration: 0.4, stagger: 0.05, y: 12 };
}
