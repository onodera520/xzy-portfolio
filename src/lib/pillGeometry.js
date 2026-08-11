export function getPillLayoutSize(element) {
  if (!element) return { width: 0, height: 0 };
  const rect = element.getBoundingClientRect?.() ?? { width: 0, height: 0 };
  return {
    width: element.offsetWidth || rect.width || 0,
    height: element.offsetHeight || rect.height || 0,
  };
}
