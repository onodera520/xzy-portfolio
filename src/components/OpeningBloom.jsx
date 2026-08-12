import { useCallback, useEffect, useRef, useState } from "react";

import {
  getNextOpeningBloomPhase,
  isOpeningBloomActivationKey,
  markOpeningBloomPlayed,
  OPENING_BLOOM_STORAGE_KEY,
  shouldPlayOpeningBloom,
} from "../lib/openingBloom.js";
import "./OpeningBloom.css";

const ARRIVAL_DELAY_MS = 300;
const READY_DELAY_MS = 900;
const REVEAL_DURATION_MS = 1600;
const REDUCED_REVEAL_DURATION_MS = 200;

export default function OpeningBloom({
  flowerSrc,
  previousDocumentPath = null,
  storageKey = OPENING_BLOOM_STORAGE_KEY,
  onComplete,
}) {
  const [phase, setPhase] = useState("idle");
  const phaseRef = useRef("idle");
  const timersRef = useRef(new Set());
  const previousOverflowRef = useRef("");
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const changePhase = useCallback((event) => {
    const next = getNextOpeningBloomPhase(phaseRef.current, event);
    phaseRef.current = next;
    setPhase(next);
    return next;
  }, []);

  const restoreScroll = useCallback(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = previousOverflowRef.current;
    }
  }, []);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    try {
      markOpeningBloomPlayed(window.sessionStorage, storageKey);
    } catch {
      // Storage failure must never block entry to the homepage.
    }
    restoreScroll();
    changePhase("finish");
    onCompleteRef.current?.();
  }, [changePhase, restoreScroll, storageKey]);

  const schedule = useCallback((callback, delay) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const activate = useCallback(() => {
    if (completedRef.current || !["arriving", "ready"].includes(phaseRef.current)) return;
    const next = changePhase("activate");
    if (next !== "revealing") return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    schedule(finish, reducedMotion ? REDUCED_REVEAL_DURATION_MS : REVEAL_DURATION_MS);
  }, [changePhase, finish, schedule]);

  useEffect(() => {
    const pathname = window.location.pathname;
    if (!shouldPlayOpeningBloom(
      window.sessionStorage,
      previousDocumentPath,
      pathname,
      storageKey,
    )) {
      completedRef.current = true;
      phaseRef.current = "complete";
      setPhase("complete");
      return undefined;
    }

    previousOverflowRef.current = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    schedule(() => changePhase("arrive"), ARRIVAL_DELAY_MS);
    schedule(() => changePhase("ready"), READY_DELAY_MS);

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
      restoreScroll();
    };
  }, [changePhase, previousDocumentPath, restoreScroll, schedule, storageKey]);

  const handleKeyDown = (event) => {
    if (!isOpeningBloomActivationKey(event.key)) return;
    event.preventDefault();
    activate();
  };

  if (phase === "complete") return null;

  return (
    <div
      className="opening-bloom"
      data-opening-bloom="true"
      data-opening-phase={phase}
      data-reduced-motion-fallback="fade"
    >
      <button
        className="opening-bloom__trigger"
        type="button"
        aria-label="点击花朵进入 XUE STUDIO"
        onClick={activate}
        onKeyDown={handleKeyDown}
      >
        <span className="opening-bloom__flower-wrap">
          <img
            className="opening-bloom__flower"
            src={flowerSrc}
            alt=""
            width="512"
            height="512"
            draggable="false"
            decoding="async"
            onError={finish}
          />
        </span>
        <span className="opening-bloom__prompt">点击绽放</span>
      </button>
    </div>
  );
}
