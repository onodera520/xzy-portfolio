import { useEffect, useRef } from "react";

import {
  createSparkBurst,
  getSparkSegment,
  shouldCreateSpark,
} from "../lib/clickSpark.js";
import "./ClickSpark.css";

const BLOCKED_TARGETS = [
  "input",
  "textarea",
  "select",
  "iframe",
  "[contenteditable='true']",
  "[data-click-spark-disabled]",
].join(",");

export default function ClickSpark({
  children,
  sparkColor = "#ffffff",
  sparkSize = 10,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 320,
  easing = "ease-out",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sparks = [];
    let frameId = 0;
    let deviceScale = 1;

    const clearCanvas = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    };

    const stopAnimation = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      sparks.length = 0;
      clearCanvas();
    };

    const resizeCanvas = () => {
      deviceScale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(window.innerWidth * deviceScale));
      canvas.height = Math.max(1, Math.round(window.innerHeight * deviceScale));
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      clearCanvas();
    };

    const renderSparks = (timestamp) => {
      frameId = 0;
      clearCanvas();

      context.strokeStyle = sparkColor;
      context.lineWidth = 2;
      context.lineCap = "round";

      let writeIndex = 0;
      for (const spark of sparks) {
        const segment = getSparkSegment(spark, timestamp, {
          duration,
          sparkRadius,
          sparkSize,
          easing,
        });
        if (!segment) continue;

        sparks[writeIndex] = spark;
        writeIndex += 1;
        context.globalAlpha = segment.alpha;
        context.beginPath();
        context.moveTo(segment.x1, segment.y1);
        context.lineTo(segment.x2, segment.y2);
        context.stroke();
      }
      sparks.length = writeIndex;
      context.globalAlpha = 1;

      if (sparks.length > 0) {
        frameId = window.requestAnimationFrame(renderSparks);
      }
    };

    const handlePointerDown = (event) => {
      const blockedTarget = event.target instanceof Element
        && Boolean(event.target.closest(BLOCKED_TARGETS));
      const canSpark = shouldCreateSpark({
        button: event.button,
        isPrimary: event.isPrimary !== false,
        reducedMotion: motionQuery.matches,
        blockedTarget,
        documentHidden: document.hidden,
      });
      if (!canSpark) return;

      sparks.push(...createSparkBurst({
        x: event.clientX,
        y: event.clientY,
        count: sparkCount,
        startTime: performance.now(),
      }));

      if (!frameId) frameId = window.requestAnimationFrame(renderSparks);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation();
    };

    const handleMotionChange = () => {
      if (motionQuery.matches) stopAnimation();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      stopAnimation();
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [duration, easing, sparkColor, sparkCount, sparkRadius, sparkSize]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="click-spark-canvas"
        aria-hidden="true"
        data-click-spark="true"
        data-spark-count={sparkCount}
        data-spark-duration={duration}
      />
      {children}
    </>
  );
}
