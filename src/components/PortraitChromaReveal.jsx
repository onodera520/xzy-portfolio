import { useEffect, useRef, useState } from "react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getRelativePointerPosition(event, element) {
  const rect = element?.getBoundingClientRect?.();
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return { x: 50, y: 50 };
  }

  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
    y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
  };
}

export function isPointerInsideElement(event, element) {
  const rect = element?.getBoundingClientRect?.();
  if (!rect || rect.width <= 0 || rect.height <= 0) return false;

  return event.clientX >= rect.left
    && event.clientX <= rect.left + rect.width
    && event.clientY >= rect.top
    && event.clientY <= rect.top + rect.height;
}

export default function PortraitChromaReveal({ portrait }) {
  const stageRef = useRef(null);
  const colorLayerRef = useRef(null);
  const frameRef = useRef(0);
  const latestPointRef = useRef({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(false);

  const flushPointerPosition = () => {
    frameRef.current = 0;
    const layer = colorLayerRef.current;
    if (!layer) return;

    layer.style.setProperty("--portrait-x", `${latestPointRef.current.x}%`);
    layer.style.setProperty("--portrait-y", `${latestPointRef.current.y}%`);
  };

  const schedulePointerPosition = (event) => {
    latestPointRef.current = getRelativePointerPosition(event, colorLayerRef.current);
    if (frameRef.current) return;

    frameRef.current = window.requestAnimationFrame(flushPointerPosition);
  };

  useEffect(() => () => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
  }, []);

  const handlePointerEnter = (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (!isPointerInsideElement(event, colorLayerRef.current)) return;
    schedulePointerPosition(event);
    setIsActive(true);
  };

  const handlePointerMove = (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (!isPointerInsideElement(event, colorLayerRef.current)) {
      setIsActive(false);
      return;
    }
    schedulePointerPosition(event);
    setIsActive(true);
  };

  const handlePointerLeave = () => {
    setIsActive(false);
  };

  return (
    <div
      ref={stageRef}
      className={`editorial-about__portrait-stage portrait-chroma-reveal${isActive ? " is-active" : ""}`}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <img
        className="editorial-about__portrait-image"
        src={portrait.src}
        alt={portrait.alt}
        width={portrait.width}
        height={portrait.height}
        loading="lazy"
        decoding="async"
      />
      <img
        ref={colorLayerRef}
        className="editorial-about__portrait-image portrait-chroma-reveal__color"
        src={portrait.src}
        alt=""
        aria-hidden="true"
        width={portrait.width}
        height={portrait.height}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
