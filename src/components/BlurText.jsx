import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";

export default function BlurText({
  text = "",
  as: Tag = "p",
  delay = 70,
  className = "",
  direction = "bottom",
  threshold = 0.12,
  rootMargin = "0px 0px -8%",
  animationFrom,
  animationTo,
  easing = "power3.out",
  stepDuration = 0.5,
}) {
  const characters = useMemo(() => [...text], [text]);
  const ref = useRef(null);

  const defaultFrom = useMemo(() => ({
    filter: "blur(10px)",
    opacity: 0,
    y: direction === "top" ? -24 : 24,
  }), [direction]);

  const defaultTo = useMemo(() => ({
    filter: "blur(0px)",
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
    const context = gsap.context(() => {
      gsap.set(characterElements, fromSnapshot);
    }, element);
    let tween;

    const play = () => {
      if (tween) return;
      tween = gsap.to(characterElements, {
        ...toSnapshot,
        duration: stepDuration * 2,
        stagger: delay / 1000,
        ease: easing,
        clearProps: "filter,opacity,transform,willChange",
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
