import { useEffect, useState } from "react";

import { normalizeBrandContrast, selectBrandContrast } from "../lib/brandContrast.js";

export function useBrandContrast({
  defaultTheme = "light",
  sampleSelector = ".nav-brand",
  regionSelector = "[data-brand-region]",
} = {}) {
  const fallback = normalizeBrandContrast(defaultTheme);
  const [theme, setTheme] = useState(fallback);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return undefined;

    let frameId = null;
    const regions = Array.from(document.querySelectorAll(regionSelector));

    const update = () => {
      frameId = null;
      const sampleElement = document.querySelector(sampleSelector);
      const sampleRect = sampleElement?.getBoundingClientRect();
      const sampleY = sampleRect
        ? sampleRect.top + sampleRect.height / 2
        : Math.min(54, window.innerHeight / 2);
      const measuredRegions = regions.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          theme: element.dataset.brandContrast,
          top: rect.top,
          bottom: rect.bottom,
        };
      });

      setTheme((current) => selectBrandContrast(measuredRegions, sampleY, fallback) || current);
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(update);
    };

    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(scheduleUpdate, {
        rootMargin: "-48px 0px -48px 0px",
        threshold: [0, 0.01, 0.99, 1],
      });
    regions.forEach((region) => observer?.observe(region));
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [fallback, regionSelector, sampleSelector]);

  return theme;
}
