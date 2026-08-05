import { useCallback, useEffect, useRef } from "react";
import "./BorderGlow.css";

function parseHSL(value) {
  const match = value.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];

  return Object.fromEntries(opacities.map((opacity, index) => [
    `--glow-color${keys[index]}`,
    `hsl(${h}deg ${s}% ${l}% / ${Math.min(opacity * intensity, 100)}%)`,
  ]));
}

const gradientPositions = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
const gradientKeys = ["--gradient-one", "--gradient-two", "--gradient-three", "--gradient-four", "--gradient-five", "--gradient-six", "--gradient-seven"];
const colorMap = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors) {
  const vars = {};
  gradientPositions.forEach((position, index) => {
    const color = colors[Math.min(colorMap[index], colors.length - 1)];
    vars[gradientKeys[index]] = `radial-gradient(at ${position}, ${color} 0px, transparent 50%)`;
  });
  vars["--gradient-base"] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(value) {
  return 1 - ((1 - value) ** 3);
}

function easeInCubic(value) {
  return value ** 3;
}

export function animateValue(
  { start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd },
  scheduler = {
    now: () => performance.now(),
    setTimeout: (callback, wait) => setTimeout(callback, wait),
    clearTimeout: (id) => clearTimeout(id),
    requestAnimationFrame: (callback) => requestAnimationFrame(callback),
    cancelAnimationFrame: (id) => cancelAnimationFrame(id),
  },
) {
  const startTime = scheduler.now() + delay;
  let timerId;
  let frameId;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    const elapsed = scheduler.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    onUpdate(start + ((end - start) * ease(progress)));
    if (progress < 1) frameId = scheduler.requestAnimationFrame(tick);
    else onEnd?.();
  };

  timerId = scheduler.setTimeout(() => {
    timerId = undefined;
    if (!cancelled) frameId = scheduler.requestAnimationFrame(tick);
  }, delay);

  return () => {
    cancelled = true;
    if (timerId !== undefined) scheduler.clearTimeout(timerId);
    if (frameId !== undefined) scheduler.cancelAnimationFrame(frameId);
  };
}

export default function BorderGlow({
  children,
  as: Component = "article",
  className = "",
  edgeSensitivity = 30,
  glowColor = "210 90 74",
  backgroundColor = "#151716",
  borderRadius = 24,
  glowRadius = 32,
  glowIntensity = 0.9,
  coneSpread = 25,
  animated = false,
  colors = ["#6ea8ff", "#b8ff68", "#75e6da"],
  fillOpacity = 0.35,
}) {
  const cardRef = useRef(null);

  const getCenter = useCallback((element) => {
    const { width, height } = element.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const handlePointerMove = useCallback((event) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const [centerX, centerY] = getCenter(card);
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const scaleX = deltaX === 0 ? Infinity : centerX / Math.abs(deltaX);
    const scaleY = deltaY === 0 ? Infinity : centerY / Math.abs(deltaY);
    const proximity = Math.min(Math.max(1 / Math.min(scaleX, scaleY), 0), 1);
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    card.style.setProperty("--edge-proximity", (proximity * 100).toFixed(3));
    card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
  }, [getCenter]);

  useEffect(() => {
    if (!animated || !cardRef.current) return undefined;
    const card = cardRef.current;
    card.classList.add("sweep-active");
    const cancelAnimations = [
      animateValue({ duration: 500, onUpdate: (value) => card.style.setProperty("--edge-proximity", value) }),
      animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: (value) => card.style.setProperty("--cursor-angle", `${(355 * (value / 100)) + 110}deg`) }),
      animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: (value) => card.style.setProperty("--cursor-angle", `${(355 * (value / 100)) + 110}deg`) }),
      animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0, onUpdate: (value) => card.style.setProperty("--edge-proximity", value), onEnd: () => card.classList.remove("sweep-active") }),
    ];

    return () => {
      cancelAnimations.forEach((cancel) => cancel());
      card.classList.remove("sweep-active");
    };
  }, [animated]);

  return (
    <Component
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={{
        "--card-bg": backgroundColor,
        "--edge-sensitivity": edgeSensitivity,
        "--border-radius": `${borderRadius}px`,
        "--glow-padding": `${glowRadius}px`,
        "--cone-spread": coneSpread,
        "--fill-opacity": fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
      }}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </Component>
  );
}
