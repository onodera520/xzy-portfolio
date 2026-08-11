import { useCallback, useEffect, useRef } from "react";

import { shouldRunContinuousMotion } from "../lib/motionActivity.js";

export function useMotionActivity(elementRef, { enabled = true } = {}) {
  const activeRef = useRef(enabled);
  const listenersRef = useRef(new Set());

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener);
    listener(activeRef.current);
    return () => listenersRef.current.delete(listener);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof window === "undefined") return undefined;

    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let inViewport = true;

    const update = () => {
      const nextActive = shouldRunContinuousMotion({
        enabled,
        inViewport,
        documentHidden: document.hidden,
        reducedMotion: motionQuery?.matches ?? false,
      });
      if (nextActive === activeRef.current) return;
      activeRef.current = nextActive;
      listenersRef.current.forEach((listener) => listener(nextActive));
    };

    const observer = typeof IntersectionObserver === "function"
      ? new IntersectionObserver(([entry]) => {
          inViewport = entry?.isIntersecting ?? true;
          update();
        }, { rootMargin: "120px" })
      : null;

    observer?.observe(element);
    document.addEventListener("visibilitychange", update);
    motionQuery?.addEventListener?.("change", update);
    update();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
      motionQuery?.removeEventListener?.("change", update);
    };
  }, [elementRef, enabled]);

  return { activeRef, subscribe };
}
