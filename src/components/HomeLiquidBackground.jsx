import { useEffect, useState } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";
const LIQUID_COLORS = ["#8db9ef", "#c084fc", "#75e6da"];

export function HomeLiquidBackground() {
  const [isDesktop, setIsDesktop] = useState(() => (
    typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches
  ));
  const [LiquidEther, setLiquidEther] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event) => setIsDesktop(event.matches);

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isDesktop) {
      setLiquidEther(null);
      return () => {
        cancelled = true;
      };
    }

    import("./LiquidEther.jsx").then(({ default: Component }) => {
      if (!cancelled) setLiquidEther(() => Component);
    });

    return () => {
      cancelled = true;
    };
  }, [isDesktop]);

  return (
    <div
      className="home-liquid-background"
      data-colors={LIQUID_COLORS.join(",")}
      data-resolution="0.5"
      aria-hidden="true"
    >
      {isDesktop && LiquidEther ? (
        <LiquidEther
          colors={LIQUID_COLORS}
          mouseForce={18}
          cursorSize={120}
          resolution={0.5}
          isViscous={false}
          isBounce={false}
          autoDemo
          autoSpeed={0.28}
          autoIntensity={1.7}
          takeoverDuration={0.3}
          autoResumeDelay={2200}
          autoRampDuration={0.8}
        />
      ) : null}
    </div>
  );
}
