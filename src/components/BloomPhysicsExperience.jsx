import { createContext, useCallback, useContext, useMemo, useRef } from "react";

import { createCrownBurst, normalizeFlowerConfig } from "../lib/flowerPhysics.js";
import FlowerFallLayer from "./FlowerFallLayer.jsx";

const emptyRef = { current: [] };
const BloomPhysicsContext = createContext({
  spawnBurst: () => {},
  registerFloor: () => {},
  subscribeBurst: () => () => {},
  flowerTargetsRef: emptyRef,
});

export function useBloomPhysics() {
  return useContext(BloomPhysicsContext);
}

export default function BloomPhysicsExperience({
  children,
  flowerSrc,
  burstCount = 8,
  mobileBurstCount = 5,
  maxFlowers = 30,
  settleMs = 10000,
  fadeMs = 800,
}) {
  const rootRef = useRef(null);
  const floorRef = useRef(null);
  const flowerTargetsRef = useRef([]);
  const burstListenersRef = useRef(new Set());
  const burstSeedRef = useRef(1);
  const config = useMemo(() => normalizeFlowerConfig({
    burstCount,
    mobileBurstCount,
    maxFlowers,
    settleMs,
    fadeMs,
  }), [burstCount, fadeMs, maxFlowers, mobileBurstCount, settleMs]);

  const registerFloor = useCallback((element) => {
    floorRef.current = element;
  }, []);

  const subscribeBurst = useCallback((listener) => {
    burstListenersRef.current.add(listener);
    return () => burstListenersRef.current.delete(listener);
  }, []);

  const spawnBurst = useCallback((viewportCrownRegion) => {
    if (!rootRef.current || typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const rootRect = rootRef.current.getBoundingClientRect();
    const mobile = window.matchMedia?.("(max-width: 767px)").matches ?? false;
    const crownRegion = {
      left: viewportCrownRegion.left - rootRect.left,
      top: viewportCrownRegion.top - rootRect.top,
      width: viewportCrownRegion.width,
      height: viewportCrownRegion.height,
    };
    const burst = createCrownBurst({
      crownRegion,
      count: mobile ? config.mobileBurstCount : config.burstCount,
      mobile,
      seed: burstSeedRef.current++,
    });
    burstListenersRef.current.forEach((listener) => listener(burst));
  }, [config]);

  const value = useMemo(() => ({
    config,
    floorRef,
    flowerTargetsRef,
    registerFloor,
    rootRef,
    spawnBurst,
    subscribeBurst,
  }), [config, registerFloor, spawnBurst, subscribeBurst]);

  return (
    <BloomPhysicsContext.Provider value={value}>
      <div
        ref={rootRef}
        className="bloom-physics-experience"
        data-bloom-physics="true"
        data-burst-count={config.burstCount}
        data-mobile-burst-count={config.mobileBurstCount}
        data-max-flowers={config.maxFlowers}
        data-settle-ms={config.settleMs}
        data-fade-ms={config.fadeMs}
        data-pause-hidden="true"
        data-pause-offscreen="true"
        data-reduced-motion="static"
      >
        {children}
        <FlowerFallLayer flowerSrc={flowerSrc} />
      </div>
    </BloomPhysicsContext.Provider>
  );
}

