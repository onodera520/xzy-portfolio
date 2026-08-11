import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import { getEntranceMotion } from "../lib/motionActivity.js";

export default function BlurText({
  text = "",
  as: Tag = "p",
  delay = 32,
  className = "",
  direction = "bottom",
  threshold = 0.12,
  rootMargin = "0px 0px -8%",
  animationFrom,
  animationTo,
  easing = "power3.out",
  stepDuration,
}) {
  const characters = useMemo(() => [...text], [text]);
  const ref = useRef(null);

  const defaultFrom = useMemo(() => ({
    opacity: 0,
    y: direction === "top" ? -14 : 14,
  }), [direction]);

  const defaultTo = useMemo(() => ({
    opacity: 1,
    y: 0,
  }), []);

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshot = Array.isArray(animationTo)
    ? animationTo.at(-1)
    : animationTo ?? defaultTo;

  useEffect(() => {
    if (!ref.current) return undefined;
    const element = ref.current;
    const characterElements = element.querySelectorAll(".blur-text__char");
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const motion = getEntranceMotion({ hero: Tag === "h1", reducedMotion });
    const context = gsap.context(() => {
      gsap.set(characterElements, reducedMotion ? { opacity: 0, y: 0 } : fromSnapshot);
    }, element);
    let tween;

    const play = () => {
      if (tween) return;
      tween = gsap.to(characterElements, {
        ...toSnapshot,
        duration: stepDuration ?? motion.duration,
        stagger: reducedMotion ? 0 : Math.min(delay / 1000, motion.stagger),
        ease: easing,
        clearProps: "opacity,transform,willChange",
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      play();
      return () => {
        tween?.kill();
        context.revert();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      tween?.kill();
      context.revert();
    };
  }, [delay, easing, fromSnapshot, rootMargin, stepDuration, threshold, toSnapshot]);

  return (
    <Tag
      ref={ref}
      className={`blur-text ${className}`.trim()}
      data-blur-text="true"
      data-enter-reveal="true"
      aria-label={text.replace(/\n/g, " ")}
    >
      {characters.map((character, index) => {
        if (character === "\n") return <br key={`break-${index}`} aria-hidden="true" />;
        return (
          <span
            aria-hidden="true"
            className="blur-text__char"
            key={`${character}-${index}`}
          >
            {character === " " ? "\u00A0" : character}
          </span>
        );
      })}
    </Tag>
  );
}
