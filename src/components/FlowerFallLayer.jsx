import Matter from "matter-js";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getFlowerCollisionRadius,
  getFlowerLifecycle,
  getRelativeFloorY,
  updateFlowerRestState,
} from "../lib/flowerPhysics.js";
import { releaseDraggedFlowerBody } from "../lib/flowerMatter.js";
import { useBloomPhysics } from "./BloomPhysicsExperience.jsx";
import "./FlowerFallLayer.css";

const { Body, Bodies, Composite, Engine } = Matter;

export default function FlowerFallLayer({ flowerSrc }) {
  const {
    config,
    floorRef,
    flowerTargetsRef,
    rootRef,
    subscribeBurst,
  } = useBloomPhysics();
  const recordsRef = useRef(new Map());
  const bodyIdRef = useRef(1);
  const engineRef = useRef(null);
  const boundariesRef = useRef([]);
  const frameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const visibleRef = useRef(true);
  const floorYRef = useRef(0);
  const [renderVersion, setRenderVersion] = useState(0);

  const removeRecord = useCallback((id) => {
    const record = recordsRef.current.get(id);
    if (!record) return;
    if (engineRef.current) Composite.remove(engineRef.current.world, record.body);
    recordsRef.current.delete(id);
    setRenderVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!rootRef.current || typeof window === "undefined") return undefined;
    const root = rootRef.current;
    const engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 0.72;
    engine.gravity.scale = 0.001;
    engineRef.current = engine;
    let disposed = false;

    const rebuildBoundaries = () => {
      boundariesRef.current.forEach((body) => Composite.remove(engine.world, body));
      const rootRect = root.getBoundingClientRect();
      const floorRect = floorRef.current?.getBoundingClientRect();
      const floorY = getRelativeFloorY(rootRect, floorRect);
      floorYRef.current = floorY;
      const boundaryOptions = { isStatic: true, render: { visible: false } };
      boundariesRef.current = [
        Bodies.rectangle(-30, floorY / 2, 60, Math.max(200, floorY * 2), boundaryOptions),
        Bodies.rectangle(rootRect.width + 30, floorY / 2, 60, Math.max(200, floorY * 2), boundaryOptions),
        Bodies.rectangle(rootRect.width / 2, floorY + 30, rootRect.width + 120, 60, boundaryOptions),
      ];
      Composite.add(engine.world, boundariesRef.current);
    };

    const addBurst = (burst) => {
      const available = Math.max(0, config.maxFlowers - recordsRef.current.size);
      burst.slice(0, available).forEach((descriptor) => {
        const id = `bloom-flower-${bodyIdRef.current++}`;
        const body = Bodies.circle(
          descriptor.x,
          descriptor.y,
          getFlowerCollisionRadius(descriptor.radius),
          {
            restitution: 0.025,
            friction: 0.82,
            frictionStatic: 1,
            frictionAir: 0.016,
            density: 0.0045,
            sleepThreshold: 55,
          },
        );
        Body.setAngle(body, descriptor.angle);
        Body.setVelocity(body, descriptor.velocity);
        Body.setAngularVelocity(body, descriptor.angularVelocity);
        Composite.add(engine.world, body);
        recordsRef.current.set(id, {
          id,
          body,
          radius: descriptor.radius,
          settledAt: null,
          stableSince: null,
          dragging: false,
          fading: false,
          element: null,
        });
      });
      if (available > 0) setRenderVersion((value) => value + 1);
    };

    const unsubscribeBurst = subscribeBurst(addBurst);
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(rebuildBoundaries);
    const intersectionObserver = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry?.isIntersecting ?? true; },
      { threshold: 0.001 },
    );
    resizeObserver?.observe(root);
    if (floorRef.current) resizeObserver?.observe(floorRef.current);
    intersectionObserver?.observe(root);
    rebuildBoundaries();

    const animate = (now) => {
      if (disposed) return;
      const records = recordsRef.current;
      const shouldRun = visibleRef.current && !document.hidden && records.size > 0;
      if (shouldRun) {
        const currentFloorY = getRelativeFloorY(
          root.getBoundingClientRect(),
          floorRef.current?.getBoundingClientRect(),
        );
        if (Math.abs(currentFloorY - floorYRef.current) > 0.5) rebuildBoundaries();
        const delta = lastTimeRef.current ? Math.min(16.667, now - lastTimeRef.current) : 16.667;
        Engine.update(engine, delta);
        const rootRect = root.getBoundingClientRect();
        const expired = [];
        const targets = [];
        records.forEach((record) => {
          const { body } = record;
          updateFlowerRestState(record, {
            speed: body.speed,
            angularSpeed: body.angularSpeed,
            dragging: record.dragging,
          }, now);
          const lifecycle = getFlowerLifecycle(record, now, config.settleMs, config.fadeMs);
          record.fading = lifecycle === "fading" || lifecycle === "expired";
          if (lifecycle === "expired") expired.push(record.id);
          const fadeProgress = record.fading
            ? Math.min(1, (now - record.settledAt - config.settleMs) / config.fadeMs)
            : 0;
          if (record.element) {
            record.element.style.transform = `translate3d(${body.position.x - record.radius}px, ${body.position.y - record.radius}px, 0) rotate(${body.angle}rad) scale(${1 - (fadeProgress * 0.55)})`;
            record.element.style.opacity = String(1 - fadeProgress);
          }
          if (!record.fading) {
            targets.push({
              id: record.id,
              x: rootRect.left + body.position.x,
              y: rootRect.top + body.position.y,
              radius: record.radius,
              settled: Number.isFinite(record.settledAt),
              dragging: record.dragging,
              fading: false,
            });
          }
        });
        flowerTargetsRef.current = targets;
        expired.forEach(removeRecord);
      }
      lastTimeRef.current = now;
      frameRef.current = window.requestAnimationFrame(animate);
    };
    frameRef.current = window.requestAnimationFrame(animate);

    const handleVisibility = () => { lastTimeRef.current = performance.now(); };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", rebuildBoundaries);
    return () => {
      disposed = true;
      unsubscribeBurst();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", rebuildBoundaries);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      flowerTargetsRef.current = [];
      Composite.clear(engine.world, false, true);
      Engine.clear(engine);
      engineRef.current = null;
    };
  }, [config, floorRef, flowerTargetsRef, removeRecord, rootRef, subscribeBurst]);

  const startDrag = (event, id) => {
    if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;
    const record = recordsRef.current.get(id);
    if (!record || record.fading) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    record.dragging = true;
    record.stableSince = null;
    Body.setStatic(record.body, true);
    event.currentTarget.classList.add("is-dragging");
  };

  const drag = (event, id) => {
    const record = recordsRef.current.get(id);
    if (!record?.dragging || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    Body.setPosition(record.body, { x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const endDrag = (event, id) => {
    const record = recordsRef.current.get(id);
    if (!record?.dragging) return;
    record.dragging = false;
    releaseDraggedFlowerBody(record.body);
    event.currentTarget.classList.remove("is-dragging");
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  void renderVersion;
  const records = Array.from(recordsRef.current.values());
  return (
    <div className="flower-fall-layer" data-flower-fall-layer="true" aria-hidden="true">
      {records.map((record) => (
        <img
          key={record.id}
          ref={(element) => { record.element = element; }}
          className="flower-fall-layer__flower"
          src={flowerSrc}
          alt=""
          draggable="false"
          style={{ width: `${record.radius * 2}px`, height: `${record.radius * 2}px` }}
          onPointerDown={(event) => startDrag(event, record.id)}
          onPointerMove={(event) => drag(event, record.id)}
          onPointerUp={(event) => endDrag(event, record.id)}
          onPointerCancel={(event) => endDrag(event, record.id)}
          onError={(event) => { event.currentTarget.hidden = true; }}
        />
      ))}
    </div>
  );
}
