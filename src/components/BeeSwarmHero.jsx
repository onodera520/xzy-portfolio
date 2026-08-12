import { useEffect, useMemo, useRef } from "react";

import {
  clampTrailLength,
  createSeededBee,
  getBeeHeading,
  getReactBitsMagnetTarget,
  getOrganicFlightSample,
  getResponsiveBeeCount,
  getSwarmMotion,
  getTrailSampleCount,
  isPointerInTrackingZone,
  shouldPauseSwarm,
  stepFlowerSpring,
} from "../lib/beeSwarm.js";
import "./BeeSwarmHero.css";

const MOBILE_BREAKPOINT = 767;

function range(value, fallback) {
  if (Array.isArray(value) && value.length === 2) return value;
  if (Number.isFinite(value)) return [value * 0.72, value];
  return fallback;
}

export default function BeeSwarmHero({
  flowerSrc,
  beeSrc,
  count = 10,
  mobileCount = 6,
  idleSpread = [190, 330],
  pointerSpread = [65, 105],
  speed = 2.5,
  trailLength = 32,
  magnetPadding = 120,
  magnetStrength = 3,
  magnetSpringStiffness = 58,
  magnetActiveDamping = 13,
  magnetReturnStiffness = 88,
  magnetReturnDamping = 13,
  trackingBoundarySelector,
  enabled = true,
  children,
  className = "",
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const flowerRef = useRef(null);
  const beeRefs = useRef([]);
  const desktopCount = Math.max(0, Math.round(count));
  const safeMobileCount = Math.min(desktopCount, Math.max(0, Math.round(mobileCount)));
  const renderedBees = useMemo(() => Array.from({ length: desktopCount }, (_, index) => index), [desktopCount]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || typeof window === "undefined") return undefined;

    const canvas = canvasRef.current;
    let context = null;
    try {
      context = canvas?.getContext?.("2d") ?? null;
    } catch {
      context = null;
    }

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const idleRange = range(idleSpread, [190, 330]);
    const pointerRange = range(pointerSpread, [60, 110]);
    const motion = getSwarmMotion(speed);
    const safeTrailLength = clampTrailLength(trailLength);
    const trailSamples = getTrailSampleCount(safeTrailLength);

    let states = [];
    let frameId = null;
    let lastTime = performance.now();
    let isInViewport = true;
    let pointerActive = false;
    let activeCount = desktopCount;
    let anchor = { x: 0, y: 0 };
    let pointer = { x: 0, y: 0 };
    let flowerCenter = { x: 0, y: 0 };
    let flowerMagnetBox = { center: { x: 0, y: 0 }, width: 0, height: 0 };
    let flowerSpring = { x: 0, y: 0, vx: 0, vy: 0 };

    const setCanvasSize = () => {
      const rect = root.getBoundingClientRect();
      activeCount = getResponsiveBeeCount(rect.width, desktopCount, safeMobileCount);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      if (canvas) {
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        context?.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const flowerRect = flowerRef.current?.getBoundingClientRect();
      flowerCenter = flowerRect
        ? {
            x: rect.width / 2,
            y: flowerRect.top - rect.top + (flowerRect.height * 0.45) - flowerSpring.y,
          }
        : { x: rect.width / 2, y: rect.height * 0.42 };
      flowerMagnetBox = flowerRect
        ? {
            center: {
              x: flowerRect.left - rect.left + (flowerRect.width / 2) - flowerSpring.x,
              y: flowerRect.top - rect.top + (flowerRect.height / 2) - flowerSpring.y,
            },
            width: flowerRect.width,
            height: flowerRect.height,
          }
        : {
            center: { ...flowerCenter },
            width: 0,
            height: 0,
          };
      if (!states.length) {
        states = renderedBees.map((index) => createSeededBee(index, flowerCenter, idleRange));
        anchor = { ...flowerCenter };
        pointer = { ...flowerCenter };
      }

      beeRefs.current.forEach((element, index) => {
        if (element) element.hidden = index >= activeCount;
      });
    };

    const drawTrails = () => {
      if (!context || !canvas) return;
      const rect = root.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = "#111111";

      states.slice(0, activeCount).forEach((bee) => {
        bee.history.slice(1, trailSamples).forEach((point, index) => {
          const alpha = 0.46 * (1 - ((index + 1) / (trailSamples + 1)));
          context.globalAlpha = alpha;
          context.beginPath();
          context.arc(point.x, point.y, Math.max(1, 2.2 - (index * 0.28)), 0, Math.PI * 2);
          context.fill();
        });
      });
      context.globalAlpha = 1;
    };

    const placeStaticBees = () => {
      setCanvasSize();
      flowerSpring = { x: 0, y: 0, vx: 0, vy: 0 };
      if (flowerRef.current) {
        flowerRef.current.style.transform = "translateX(-50%) translate3d(0, 0, 0)";
      }
      states.forEach((bee, index) => {
        const element = beeRefs.current[index];
        if (!element || index >= activeCount) return;
        element.style.transform = `translate3d(${bee.x}px, ${bee.y}px, 0) translate(-50%, -50%) rotate(${bee.angle}rad)`;
      });
      context?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
    };

    const animate = (now) => {
      frameId = null;
      if (shouldPauseSwarm({
        enabled,
        inViewport: isInViewport,
        documentHidden: document.hidden,
        reducedMotion: reduceMotionQuery.matches,
      })) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const mobile = root.clientWidth <= MOBILE_BREAKPOINT;
      const tracksPointer = !mobile && finePointerQuery.matches && pointerActive;
      const targetAnchor = tracksPointer ? pointer : flowerCenter;
      const anchorFollow = 1 - Math.exp(-14 * dt);
      anchor.x += (targetAnchor.x - anchor.x) * anchorFollow;
      anchor.y += (targetAnchor.y - anchor.y) * anchorFollow;
      const orbitRange = tracksPointer ? pointerRange : idleRange;
      const elapsedSeconds = now * 0.001;

      const flowerTarget = getReactBitsMagnetTarget(pointer, flowerMagnetBox.center, {
        active: tracksPointer,
        width: flowerMagnetBox.width,
        height: flowerMagnetBox.height,
        padding: magnetPadding,
        magnetStrength,
      });
      const magnetEngaged = Math.abs(flowerTarget.x) > 0.001 || Math.abs(flowerTarget.y) > 0.001;
      flowerSpring = stepFlowerSpring(flowerSpring, flowerTarget, {
        stiffness: magnetEngaged ? magnetSpringStiffness : magnetReturnStiffness,
        damping: magnetEngaged ? magnetActiveDamping : magnetReturnDamping,
        dt,
      });
      if (flowerRef.current) {
        flowerRef.current.style.transform = `translateX(-50%) translate3d(${flowerSpring.x}px, ${flowerSpring.y}px, 0)`;
      }

      states.slice(0, activeCount).forEach((bee, index) => {
        const ratio = ((index * 0.61803398875) % 1);
        const organic = getOrganicFlightSample(index, elapsedSeconds, tracksPointer);
        const baseOrbitRadius = orbitRange[0] + ((orbitRange[1] - orbitRange[0]) * ratio);
        const orbitRadius = baseOrbitRadius * organic.radiusScale;
        const dx = anchor.x - bee.x;
        const dy = (anchor.y - bee.y) / organic.verticalScale;
        const distance = Math.hypot(dx, dy) || 0.0001;
        const ux = dx / distance;
        const uy = dy / distance;
        const band = Math.max(20, (orbitRange[1] - orbitRange[0]) * 0.75);
        const radial = Math.max(-1, Math.min(1, (distance - orbitRadius) / band));
        const directionDrift = 0.48 + (organic.turnBias * 0.72);
        const swirl = Math.sqrt(Math.max(0, 1 - (radial * radial))) * bee.direction * directionDrift;
        let wishX = (ux * radial) - (uy * swirl);
        let wishY = ((uy * radial) + (ux * swirl)) * organic.verticalScale;
        const cosOffset = Math.cos(organic.angleOffset);
        const sinOffset = Math.sin(organic.angleOffset);
        const rotatedX = (wishX * cosOffset) - (wishY * sinOffset);
        wishY = (wishX * sinOffset) + (wishY * cosOffset);
        wishX = rotatedX;
        const wishLength = Math.hypot(wishX, wishY) || 0.0001;
        wishX /= wishLength;
        wishY /= wishLength;

        let separationX = 0;
        let separationY = 0;
        states.slice(0, activeCount).forEach((other) => {
          if (other === bee) return;
          const dx = bee.x - other.x;
          const dy = bee.y - other.y;
          const distance = Math.hypot(dx, dy);
          const separationDistance = tracksPointer ? 42 : 54;
          if (distance > 0 && distance < separationDistance) {
            const force = (1 - (distance / separationDistance)) * motion.maxSpeed * 0.62;
            separationX += (dx / distance) * force;
            separationY += (dy / distance) * force;
          }
        });

        let accelerationX = ((wishX * motion.maxSpeed) - bee.vx) * motion.steerRate + separationX;
        let accelerationY = ((wishY * motion.maxSpeed) - bee.vy) * motion.steerRate + separationY;
        const acceleration = Math.hypot(accelerationX, accelerationY);
        const accelerationCap = motion.maxSpeed * 9;
        if (acceleration > accelerationCap) {
          accelerationX = (accelerationX / acceleration) * accelerationCap;
          accelerationY = (accelerationY / acceleration) * accelerationCap;
        }

        bee.vx += accelerationX * dt;
        bee.vy += accelerationY * dt;
        const velocity = Math.hypot(bee.vx, bee.vy);
        if (velocity > motion.maxSpeed) {
          bee.vx = (bee.vx / velocity) * motion.maxSpeed;
          bee.vy = (bee.vy / velocity) * motion.maxSpeed;
        } else if (velocity > 0.001 && velocity < motion.minSpeed) {
          bee.vx = (bee.vx / velocity) * motion.minSpeed;
          bee.vy = (bee.vy / velocity) * motion.minSpeed;
        }

        bee.x += bee.vx * dt;
        bee.y += bee.vy * dt;
        bee.angle = getBeeHeading(bee.vx, bee.vy, bee.angle);

        const lastTrailPoint = bee.history[0];
        const spacing = safeTrailLength / Math.max(1, trailSamples - 1);
        if (!lastTrailPoint || Math.hypot(bee.x - lastTrailPoint.x, bee.y - lastTrailPoint.y) >= spacing) {
          bee.history.unshift({ x: bee.x, y: bee.y });
          bee.history.length = Math.min(bee.history.length, trailSamples);
        }

        const element = beeRefs.current[index];
        if (element) {
          element.style.transform = `translate3d(${bee.x}px, ${bee.y}px, 0) translate(-50%, -50%) rotate(${bee.angle}rad)`;
        }
      });

      drawTrails();
      frameId = window.requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (frameId === null) return;
      window.cancelAnimationFrame(frameId);
      frameId = null;
    };

    const syncAnimation = () => {
      const reducedMotion = reduceMotionQuery.matches;
      const paused = shouldPauseSwarm({
        enabled,
        inViewport: isInViewport,
        documentHidden: document.hidden,
        reducedMotion,
      });

      if (paused) {
        stopAnimation();
        if (reducedMotion) placeStaticBees();
        return;
      }

      if (frameId === null) {
        lastTime = performance.now();
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const updatePointerTracking = (event) => {
      if (!finePointerQuery.matches || root.clientWidth <= MOBILE_BREAKPOINT) {
        pointerActive = false;
        return;
      }
      const rect = root.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const boundary = trackingBoundarySelector
        ? root.querySelector(trackingBoundarySelector)
        : null;
      const boundaryRect = boundary?.getBoundingClientRect();
      const trackingBottom = boundaryRect
        ? Math.max(0, Math.min(rect.height, boundaryRect.top - rect.top))
        : rect.height;
      pointerActive = isPointerInTrackingZone(pointer, {
        left: 0,
        top: 0,
        right: rect.width,
        bottom: trackingBottom,
      });
    };
    const handlePointerLeave = () => { pointerActive = false; };

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(setCanvasSize);
    const intersectionObserver = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry?.isIntersecting ?? true;
        syncAnimation();
      },
      { threshold: 0.01 },
    );

    setCanvasSize();
    resizeObserver?.observe(root);
    intersectionObserver?.observe(root);
    root.addEventListener("pointerenter", updatePointerTracking);
    root.addEventListener("pointermove", updatePointerTracking);
    root.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", setCanvasSize);
    document.addEventListener("visibilitychange", syncAnimation);
    reduceMotionQuery.addEventListener("change", syncAnimation);
    syncAnimation();

    return () => {
      stopAnimation();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      root.removeEventListener("pointerenter", updatePointerTracking);
      root.removeEventListener("pointermove", updatePointerTracking);
      root.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", setCanvasSize);
      document.removeEventListener("visibilitychange", syncAnimation);
      reduceMotionQuery.removeEventListener("change", syncAnimation);
    };
  }, [
    desktopCount,
    enabled,
    idleSpread,
    magnetPadding,
    magnetStrength,
    magnetActiveDamping,
    magnetReturnDamping,
    magnetReturnStiffness,
    magnetSpringStiffness,
    pointerSpread,
    renderedBees,
    safeMobileCount,
    speed,
    trackingBoundarySelector,
    trailLength,
  ]);

  return (
    <div
      ref={rootRef}
      className={`bee-swarm${className ? ` ${className}` : ""}`}
      data-bee-swarm="true"
      data-desktop-count={desktopCount}
      data-mobile-count={safeMobileCount}
      data-speed={speed}
      data-magnet-padding={magnetPadding}
      data-magnet-strength={magnetStrength}
      data-magnet-spring={`${magnetSpringStiffness}/${magnetActiveDamping}/${magnetReturnStiffness}/${magnetReturnDamping}`}
      data-pointer-spread={range(pointerSpread, [65, 105]).join("-")}
      data-tracking-boundary={trackingBoundarySelector || undefined}
    >
      <canvas ref={canvasRef} className="bee-swarm__trail" aria-hidden="true" />
      <div className="bee-swarm__bees" aria-hidden="true">
        {renderedBees.map((index) => (
          <img
            className="bee-swarm__bee"
            src={beeSrc}
            alt=""
            draggable="false"
            decoding="async"
            key={index}
            ref={(element) => { beeRefs.current[index] = element; }}
            onError={(event) => { event.currentTarget.hidden = true; }}
          />
        ))}
      </div>
      <div className="bee-swarm__foreground">
        <img
          ref={flowerRef}
          className="bee-swarm__flower"
          src={flowerSrc}
          alt="黑白花束插画"
          width="1425"
          height="1600"
          decoding="async"
          onError={(event) => { event.currentTarget.hidden = true; }}
        />
        {children}
      </div>
    </div>
  );
}
