export function calculateDemoScale({
  viewportWidth,
  viewportHeight,
  canvasWidth,
  canvasHeight,
}) {
  const measurements = [viewportWidth, viewportHeight, canvasWidth, canvasHeight];
  const measurementsAreValid = measurements.every(
    (value) => Number.isFinite(value) && value > 0,
  );

  if (!measurementsAreValid) {
    return {
      scale: 1,
      renderedWidth: canvasWidth || 0,
      renderedHeight: canvasHeight || 0,
    };
  }

  const scale = Math.min(
    viewportWidth / canvasWidth,
    viewportHeight / canvasHeight,
  );

  const roundMeasurement = (value) => Math.round(value * 1000) / 1000;

  return {
    scale,
    renderedWidth: roundMeasurement(canvasWidth * scale),
    renderedHeight: roundMeasurement(canvasHeight * scale),
  };
}
