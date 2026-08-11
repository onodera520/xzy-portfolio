const EASING_FUNCTIONS = {
  linear: (progress) => progress,
  "ease-in": (progress) => progress * progress,
  "ease-out": (progress) => 1 - ((1 - progress) ** 2),
  "ease-in-out": (progress) => (
    progress < 0.5
      ? 2 * progress * progress
      : 1 - ((-2 * progress + 2) ** 2) / 2
  ),
};

export function createSparkBurst({ x, y, count = 8, startTime = 0 }) {
  const safeCount = Math.max(1, Math.floor(count));

  return Array.from({ length: safeCount }, (_, index) => ({
    x,
    y,
    angle: (Math.PI * 2 * index) / safeCount,
    startTime,
  }));
}

export function getSparkSegment(
  spark,
  timestamp,
  {
    duration = 320,
    sparkRadius = 18,
    sparkSize = 10,
    easing = "ease-out",
  } = {},
) {
  const safeDuration = Math.max(1, duration);
  const elapsed = timestamp - spark.startTime;
  if (elapsed < 0 || elapsed >= safeDuration) return null;

  const progress = elapsed / safeDuration;
  const easedProgress = (EASING_FUNCTIONS[easing] ?? EASING_FUNCTIONS["ease-out"])(progress);
  const distance = easedProgress * sparkRadius;
  const lineLength = sparkSize * (1 - easedProgress);
  const cos = Math.cos(spark.angle);
  const sin = Math.sin(spark.angle);
  const x1 = spark.x + distance * cos;
  const y1 = spark.y + distance * sin;

  return {
    x1,
    y1,
    x2: x1 + lineLength * cos,
    y2: y1 + lineLength * sin,
    alpha: 1 - progress,
  };
}

export function shouldCreateSpark({
  button,
  isPrimary,
  reducedMotion,
  blockedTarget,
  documentHidden,
}) {
  return button === 0
    && isPrimary
    && !reducedMotion
    && !blockedTarget
    && !documentHidden;
}
