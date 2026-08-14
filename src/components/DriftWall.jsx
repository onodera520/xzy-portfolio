import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useVelocity } from "motion/react";

import {
  buildDriftWallColumns,
  resolveDriftWallActiveColumn,
  resolveDriftWallActiveId,
  resolveDriftWallCopyCount,
  resolveDriftWallTransform,
  shouldAdvanceDriftColumn,
} from "../lib/driftWall.js";
import { resolveScrollDirection, verticalScrollDisplacement, wrapOffset } from "../lib/scrollVelocity.js";
import { useMotionActivity } from "./useMotionActivity.js";
import "./DriftWall.css";

function useElementHeight(ref) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const updateHeight = () => setHeight(element.offsetHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}

function DriftImage({ active = false, image }) {
  return (
    <picture className={`drift-wall__media${active ? " is-active" : ""}`}>
      <source media="(max-width: 767px)" srcSet={image.mobile} />
      <img
        className="drift-wall__image"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="eager"
        decoding="async"
        draggable="false"
      />
    </picture>
  );
}

function DriftColumn({ activeColumn, activeId, activeRef, columnIndex, containerHeight, images, pauseOnHover, rawScrollVelocity, speed, variance }) {
  const trackRef = useRef(null);
  const sequenceRef = useRef(null);
  const offsetRef = useMotionValue(0);
  const directionRef = useRef(1);
  const sequenceHeight = useElementHeight(sequenceRef);
  const reduceMotion = useReducedMotion();
  const copyCount = resolveDriftWallCopyCount({ containerHeight, sequenceHeight });
  const speedFactor = 1 + variance * ((((columnIndex * 0.6180339887 + 0.35) % 1) * 2) - 1);

  useAnimationFrame((_, delta) => {
    if (
      reduceMotion
      || !activeRef.current
      || !sequenceHeight
      || !shouldAdvanceDriftColumn(activeColumn, columnIndex, pauseOnHover)
    ) return;

    const currentVelocity = Math.max(-1800, Math.min(1800, rawScrollVelocity.get()));
    directionRef.current = resolveScrollDirection(currentVelocity, directionRef.current);
    const next = offsetRef.get() + verticalScrollDisplacement({
      scrollVelocity: currentVelocity,
      deltaMs: Math.min(delta, 40),
      velocity: speed * speedFactor,
      columnIndex,
      direction: directionRef.current,
    });
    const wrapped = wrapOffset(-sequenceHeight, 0, next);
    offsetRef.set(wrapped);
    if (trackRef.current) trackRef.current.style.transform = `translate3d(0, ${wrapped}px, 0)`;
  });

  return (
    <div className="drift-wall__column">
      <div className="drift-wall__track" ref={trackRef}>
        {Array.from({ length: copyCount }, (_, copyIndex) => (
          <div
            className="drift-wall__sequence"
            aria-hidden={copyIndex > 0 ? "true" : undefined}
            key={copyIndex}
            ref={copyIndex === 0 ? sequenceRef : null}
          >
            {images.map((image, imageIndex) => {
              const tileId = `${columnIndex}-${copyIndex}-${imageIndex}`;
              return (
                <div
                  className={`drift-wall__tile${activeId === tileId ? " is-active" : ""}`}
                  data-drift-tile={tileId}
                  key={tileId}
                >
                  <DriftImage active={activeId === tileId} image={image} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DriftWall({
  images = [],
  columns = 5,
  speed = 40,
  variance = 0.45,
  tilt = 0,
  turn = 0,
  roll = 0,
  perspective = 1000,
  depth = 130,
  parallax = 1,
  overlay = "#000000",
  gap = 12,
  radius = 16,
  lift = 76,
  fade = 0.6,
  dim = 0.8,
  grayscale = true,
  pauseOnHover = true,
}) {
  const rootRef = useRef(null);
  const planeRef = useRef(null);
  const pointerRef = useRef({ clientX: 0, clientY: 0, inside: false, x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const [containerHeight, setContainerHeight] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const { activeRef } = useMotionActivity(rootRef);
  const { scrollY } = useScroll();
  const rawScrollVelocity = useVelocity(scrollY);
  const reduceMotion = useReducedMotion();
  const columnImages = useMemo(
    () => buildDriftWallColumns(images, columns, 4),
    [columns, images],
  );
  const activeColumn = resolveDriftWallActiveColumn(activeId);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const updateHeight = () => setContainerHeight(root.clientHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const applyPlaneTransform = useCallback((x, y) => {
    if (!planeRef.current) return;
    planeRef.current.style.transform = resolveDriftWallTransform({
      pointerX: x,
      pointerY: y,
      tilt,
      turn,
      roll,
      depth,
      parallax,
    });
  }, [depth, parallax, roll, tilt, turn]);

  useEffect(() => {
    applyPlaneTransform(0, 0);
  }, [applyPlaneTransform]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !activeRef.current) return;
    const damping = 1 - Math.exp(-Math.min(delta, 40) / 120);
    pointerDampedRef.current.x += (pointerRef.current.x - pointerDampedRef.current.x) * damping;
    pointerDampedRef.current.y += (pointerRef.current.y - pointerDampedRef.current.y) * damping;
    applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y);
  });

  const handlePointerMove = (event) => {
    if (reduceMotion || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    pointerRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      inside: true,
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    };
    setActiveId(resolveDriftWallActiveId(event.target));
  };

  return (
    <section
      ref={rootRef}
      id="process-drift-wall"
      className="drift-wall"
      data-drift-wall="true"
      data-continuous-motion="managed"
      aria-label="项目画板透视图片墙"
      style={{
        "--drift-perspective": `${perspective}px`,
        "--drift-overlay": overlay,
        "--drift-gap": `${gap}px`,
        "--drift-radius": `${radius}px`,
        "--drift-lift": `${lift}px`,
        "--drift-fade": fade,
        "--drift-dim": dim,
        "--drift-grayscale": grayscale ? 1 : 0,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerRef.current = { x: 0, y: 0, inside: false };
        setActiveId(null);
      }}
    >
      <div ref={planeRef} className="drift-wall__plane" aria-hidden="true">
        {columnImages.map((imagesForColumn, columnIndex) => (
          <DriftColumn
            activeColumn={activeColumn}
            activeId={activeId}
            activeRef={activeRef}
            columnIndex={columnIndex}
            containerHeight={containerHeight}
            images={imagesForColumn}
            key={columnIndex}
            pauseOnHover={pauseOnHover}
            rawScrollVelocity={rawScrollVelocity}
            speed={speed}
            variance={variance}
          />
        ))}
      </div>
      <div className="drift-wall__scrim" aria-hidden="true" />
    </section>
  );
}
