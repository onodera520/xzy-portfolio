import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useVelocity,
  useTransform,
} from "motion/react";

import {
  resolveScrollDirection,
  scrollDisplacement,
  wrapOffset,
} from "../lib/scrollVelocity.js";
import "./ScrollVelocity.css";

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const updateWidth = () => setWidth(element.offsetWidth);
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);
    window.addEventListener("resize", updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [ref]);

  return width;
}

function VelocityRow({
  children,
  rowIndex,
  scrollContainerRef,
  velocity,
  damping,
  stiffness,
  numCopies,
  className,
}) {
  const baseX = useMotionValue(0);
  const directionRef = useRef(1);
  const copyRef = useRef(null);
  const copyWidth = useElementWidth(copyRef);
  const reduceMotion = useReducedMotion();
  const scrollOptions = scrollContainerRef?.current
    ? { container: scrollContainerRef }
    : {};
  const { scrollY } = useScroll(scrollOptions);
  const rawScrollVelocity = useVelocity(scrollY);
  const smoothScrollVelocity = useSpring(rawScrollVelocity, {
    damping,
    stiffness,
  });

  const x = useTransform(baseX, (value) => {
    if (!copyWidth) return "0px";
    return `${wrapOffset(-copyWidth, 0, value)}px`;
  });

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;

    const currentVelocity = Math.max(
      -2400,
      Math.min(2400, smoothScrollVelocity.get()),
    );
    directionRef.current = resolveScrollDirection(
      currentVelocity,
      directionRef.current,
    );
    baseX.set(
      baseX.get()
        + scrollDisplacement({
          scrollVelocity: currentVelocity,
          deltaMs: Math.min(delta, 40),
          velocity,
          rowIndex,
          direction: directionRef.current,
        }),
    );
  });

  return (
    <div className="scroll-velocity-row" aria-label={typeof children === "string" ? children : undefined}>
      <motion.div className="scroll-velocity-track" style={{ x }}>
        {Array.from({ length: numCopies }, (_, index) => (
          <span
            aria-hidden="true"
            className={`scroll-velocity-copy ${className}`.trim()}
            key={index}
            ref={index === 0 ? copyRef : null}
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity({
  scrollContainerRef,
  texts = [],
  velocity = 36,
  className = "",
  damping = 46,
  stiffness = 280,
  numCopies = 6,
}) {
  return (
    <section className="scroll-velocity" aria-label="作品集方向">
      {texts.map((text, index) => (
        <VelocityRow
          className={className}
          damping={damping}
          key={index}
          numCopies={numCopies}
          rowIndex={index}
          scrollContainerRef={scrollContainerRef}
          stiffness={stiffness}
          velocity={velocity}
        >
          {text}
        </VelocityRow>
      ))}
    </section>
  );
}
