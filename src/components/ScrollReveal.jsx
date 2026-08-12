import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef } from "react";

import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal({
  children,
  baseOpacity = 0.18,
  enableBlur = true,
  baseRotation = 1,
  blurStrength = 3,
  scrollStart = "top bottom-=8%",
  scrollEnd = "bottom center+=12%",
  className = "",
}) {
  const containerRef = useRef(null);
  const text = typeof children === "string" ? children : "";
  const tokens = useMemo(() => {
    const segments = text.match(/[A-Za-z0-9]+|\s+|./gu) ?? [];
    return segments;
  }, [text]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const wordElements = container.querySelectorAll(".scroll-reveal__word");
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    if (reducedMotion) {
      gsap.set(wordElements, { opacity: 1, rotate: 0, filter: "blur(0px)" });
      return () => gsap.set(wordElements, { clearProps: "opacity,transform,filter" });
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        wordElements,
        {
          opacity: baseOpacity,
          rotate: baseRotation,
          filter: enableBlur ? `blur(${blurStrength}px)` : "blur(0px)",
          transformOrigin: "50% 70%",
          willChange: "opacity, transform, filter",
        },
        {
          opacity: 1,
          rotate: 0,
          filter: "blur(0px)",
          stagger: 0.025,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: scrollStart,
            end: scrollEnd,
            scrub: true,
          },
        },
      );
    }, container);

    return () => context.revert();
  }, [baseOpacity, baseRotation, blurStrength, enableBlur, scrollEnd, scrollStart]);

  return (
    <p
      ref={containerRef}
      className={`scroll-reveal ${className}`.trim()}
      data-scroll-reveal="true"
      aria-label={text || undefined}
    >
      {text
        ? tokens.map((token, index) => (
            token.trim().length === 0
              ? <span aria-hidden="true" key={`space-${index}`}>{token}</span>
              : (
                <span
                  aria-hidden="true"
                  className="scroll-reveal__word"
                  data-scroll-reveal-token="true"
                  key={`${token}-${index}`}
                >
                  {token}
                </span>
              )
          ))
        : children}
    </p>
  );
}
