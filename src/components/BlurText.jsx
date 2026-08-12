import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import { getBeeScrambleSprite, selectBeeScrambleTargets } from "../lib/beeScramble.js";
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
  scramble,
}) {
  const characters = useMemo(() => [...text], [text]);
  const ref = useRef(null);
  const scrambleFrameRef = useRef(null);

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

  useEffect(() => {
    const element = ref.current;
    if (!element || !scramble || typeof window === "undefined") return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const slots = Array.from(element.querySelectorAll(".blur-text__scramble-slot"));
    const radius = scramble.radius ?? 120;
    const minCount = scramble.minCount ?? 2;
    const maxCount = scramble.maxCount ?? 4;
    const activeLimit = scramble.activeLimit ?? Number.POSITIVE_INFINITY;
    const minDuration = scramble.minDuration ?? 0.35;
    const maxDuration = scramble.maxDuration ?? 0.55;
    const timelines = new Map();
    let lastPointer = null;

    const reset = () => {
      if (scrambleFrameRef.current !== null) {
        window.cancelAnimationFrame(scrambleFrameRef.current);
        scrambleFrameRef.current = null;
      }
      timelines.forEach((timeline) => timeline.kill());
      timelines.clear();
      lastPointer = null;
      slots.forEach((slot) => {
        const letter = slot.querySelector(".blur-text__scramble-letter");
        const sprites = slot.querySelectorAll(".blur-text__scramble-art");
        gsap.set(letter, { opacity: 1, scale: 1 });
        gsap.set(sprites, { opacity: 0, scale: 0.82, rotate: -8 });
      });
    };

    const flicker = (slot, index, spriteKind) => {
      const letter = slot.querySelector(".blur-text__scramble-letter");
      const sprite = slot.querySelector(`.blur-text__scramble-${spriteKind} .blur-text__scramble-art`);
      const otherSprites = slot.querySelectorAll(`.blur-text__scramble-sprite:not(.blur-text__scramble-${spriteKind}) .blur-text__scramble-art`);
      if (!letter || !sprite) return;
      if (timelines.has(index)) return;
      gsap.set(otherSprites, { opacity: 0, scale: 0.82, rotate: -8 });
      const duration = minDuration + (((index * 0.61803398875) % 1) * (maxDuration - minDuration));
      const timeline = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          timelines.delete(index);
          scheduleUpdate();
        },
      });
      timeline
        .to(letter, { opacity: 0, scale: 0.86, duration: duration * 0.22, ease: "power2.out" }, 0)
        .fromTo(sprite,
          { opacity: 0, scale: 0.82, rotate: -8 },
          { opacity: 1, scale: 1, rotate: 0, duration: duration * 0.24, ease: "power2.out" },
          0,
        )
        .to(sprite, { opacity: 0, scale: 1.08, duration: duration * 0.34, ease: "power2.inOut" }, duration * 0.58)
        .to(letter, { opacity: 1, scale: 1, duration: duration * 0.24, ease: "power2.out" }, duration * 0.7);
      timelines.set(index, timeline);
    };

    const runUpdate = () => {
      if (!lastPointer) return;
      const candidates = slots.map((slot, index) => {
        const rect = slot.getBoundingClientRect();
        return {
          index,
          distance: Math.hypot(
            lastPointer.x - (rect.left + (rect.width / 2)),
            lastPointer.y - (rect.top + (rect.height / 2)),
          ),
        };
      });
      selectBeeScrambleTargets(candidates, {
        radius,
        minCount,
        maxCount,
        activeLimit,
        excludedIndices: new Set(timelines.keys()),
      }).forEach((index, order) => {
        flicker(slots[index], index, getBeeScrambleSprite(order));
      });
    };

    const scheduleUpdate = () => {
      if (!lastPointer || scrambleFrameRef.current !== null) return;
      scrambleFrameRef.current = window.requestAnimationFrame(() => {
        scrambleFrameRef.current = null;
        runUpdate();
      });
    };

    const update = (event) => {
      if (!finePointer.matches || reducedMotion.matches) {
        reset();
        return;
      }
      lastPointer = { x: event.clientX, y: event.clientY };
      scheduleUpdate();
    };

    element.addEventListener("pointermove", update);
    element.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    reducedMotion.addEventListener("change", reset);
    finePointer.addEventListener("change", reset);
    return () => {
      reset();
      element.removeEventListener("pointermove", update);
      element.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      reducedMotion.removeEventListener("change", reset);
      finePointer.removeEventListener("change", reset);
    };
  }, [scramble]);

  return (
    <Tag
      ref={ref}
      className={`blur-text ${className}`.trim()}
      data-blur-text="true"
      data-enter-reveal="true"
      data-scrambled-text={scramble ? "true" : undefined}
      data-scramble-trigger={scramble ? "title" : undefined}
      data-scramble-radius={scramble?.radius}
      data-scramble-limit={scramble?.activeLimit}
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
            {scramble && character !== " " ? (
              <span className="blur-text__scramble-slot">
                <span className="blur-text__scramble-letter">{character}</span>
                <span className="blur-text__scramble-sprite blur-text__scramble-bee" aria-hidden="true">
                  <img
                    className="blur-text__scramble-art"
                    src={scramble.beeSrc}
                    alt=""
                    draggable="false"
                  />
                </span>
                <span className="blur-text__scramble-sprite blur-text__scramble-flower" aria-hidden="true">
                  <img
                    className="blur-text__scramble-art"
                    src={scramble.flowerSrc}
                    alt=""
                    draggable="false"
                  />
                </span>
              </span>
            ) : (
              character === " " ? "\u00A0" : character
            )}
          </span>
        );
      })}
    </Tag>
  );
}
