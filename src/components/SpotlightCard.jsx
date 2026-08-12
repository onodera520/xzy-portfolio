import { useEffect, useRef } from "react";

import "./SpotlightCard.css";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export function canUseSpotlightPointer(windowRoot = null) {
  return windowRoot?.matchMedia?.(FINE_POINTER_QUERY)?.matches === true;
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(121, 168, 255, 0.16)",
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof window === "undefined") return undefined;

    const pointerQuery = window.matchMedia?.(FINE_POINTER_QUERY);
    let isListening = false;

    const updateSpotlight = (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
    };

    const syncPointerListener = () => {
      const shouldListen = pointerQuery?.matches === true;
      if (shouldListen && !isListening) {
        card.addEventListener("pointermove", updateSpotlight, { passive: true });
        isListening = true;
      } else if (!shouldListen && isListening) {
        card.removeEventListener("pointermove", updateSpotlight);
        isListening = false;
      }
    };

    syncPointerListener();
    pointerQuery?.addEventListener?.("change", syncPointerListener);

    return () => {
      if (isListening) card.removeEventListener("pointermove", updateSpotlight);
      pointerQuery?.removeEventListener?.("change", syncPointerListener);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`.trim()}
      data-spotlight-card="true"
      style={{ "--spotlight-color": spotlightColor }}
    >
      {children}
    </div>
  );
}
