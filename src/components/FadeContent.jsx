import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { getEntranceMotion } from "../lib/motionActivity.js";

gsap.registerPlugin(ScrollTrigger);

export default function FadeContent({
  children,
  duration,
  ease = "power2.out",
  delay = 0,
  hero = false,
  threshold = 0.14,
  initialOpacity = 0,
  className = "",
  style,
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const startPct = (1 - threshold) * 100;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const motion = getEntranceMotion({ hero, reducedMotion });

    gsap.set(element, {
      autoAlpha: initialOpacity,
      y: motion.y,
      willChange: "opacity, transform",
    });

    const tween = gsap.to(element, {
      autoAlpha: 1,
      y: 0,
      duration: duration ?? motion.duration,
      delay: reducedMotion ? 0 : delay,
      ease,
      paused: true,
      onComplete: () => gsap.set(element, { clearProps: "willChange" }),
    });

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: `top ${startPct}%`,
      once: true,
      onEnter: () => tween.play(),
    });

    return () => {
      trigger.kill();
      tween.kill();
      gsap.killTweensOf(element);
    };
  }, [delay, duration, ease, hero, initialOpacity, threshold]);

  return (
    <div
      ref={ref}
      className={`fade-content ${className}`.trim()}
      data-enter-reveal="true"
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
