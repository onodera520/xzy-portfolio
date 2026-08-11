export function calculateAccordionLayout({
  width,
  paddingLeft = 0,
  paddingRight = 0,
  height,
  count,
  gap,
  activeIndex,
  aspectRatio = 16 / 9,
  minCollapsedWidth = 72,
}) {
  const panelCount = Math.max(1, Math.floor(count));
  const safeGap = Math.max(0, gap);
  const contentWidth = Math.max(0, width - paddingLeft - paddingRight);
  const usableWidth = Math.max(0, contentWidth - (safeGap * (panelCount - 1)));
  const equalWidth = usableWidth / panelCount;
  const hasActive = Number.isInteger(activeIndex) && activeIndex >= 0 && activeIndex < panelCount;

  if (panelCount === 1) {
    const activeWidth = Math.min(usableWidth, height * aspectRatio);
    return {
      galleryHeight: activeWidth / aspectRatio,
      activeWidth,
      collapsedWidth: activeWidth,
      panelWidths: [activeWidth],
    };
  }

  const maximumActiveWidth = Math.max(
    equalWidth,
    usableWidth - (minCollapsedWidth * (panelCount - 1)),
  );
  const activeWidth = Math.max(equalWidth, Math.min(height * aspectRatio, maximumActiveWidth));
  const collapsedWidth = (usableWidth - activeWidth) / (panelCount - 1);
  const galleryHeight = activeWidth / aspectRatio;
  const panelWidths = Array.from(
    { length: panelCount },
    (_, index) => (hasActive && index === activeIndex ? activeWidth : hasActive ? collapsedWidth : equalWidth),
  );

  return { galleryHeight, activeWidth, collapsedWidth, panelWidths };
}

export function shouldShowAccordionLabel({
  hasActive,
  isActive,
  panelWidth,
  contentWidth,
  chromeWidth = 75,
}) {
  return !hasActive || isActive || panelWidth >= contentWidth + chromeWidth;
}
