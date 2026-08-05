import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function FadeContent({
  children,
  blur = true,
  duration = 1,
  ease = "power2.out",
  delay = 0,
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

    gsap.set(element, {
      autoAlpha: initialOpacity,
      filter: blur ? "blur(8px)" : "blur(0px)",
      y: 16,
      willChange: "opacity, filter, transform",
    });

    const tween = gsap.to(element, {
      autoAlpha: 1,
      filter: "blur(0px)",
      y: 0,
      duration,
      delay,
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
  }, [blur, delay, duration, ease, initialOpacity, threshold]);

  return (
    <div ref={ref} className={`fade-content ${className}`.trim()} style={style} {...props}>
      {children}
    </div>
  );
}
