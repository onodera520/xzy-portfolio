import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  useVelocity,
} from "motion/react";

import { useMotionActivity } from "./useMotionActivity.js";
import {
  resolveScrollDirection,
  verticalScrollDisplacement,
  wrapOffset,
} from "../lib/scrollVelocity.js";
import "./VerticalProjectMarquee.css";

function useElementHeight(ref) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const updateHeight = () => setHeight(element.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return height;
}

function MarqueeImage({ image }) {
  return (
    <picture className="vertical-project-marquee__media">
      <source media="(max-width: 767px)" srcSet={image.mobile} />
      <img
        className="vertical-project-marquee__image"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}

function VerticalColumn({
  activeRef,
  columnIndex,
  images,
  numCopies,
  rawScrollVelocity,
  velocity,
}) {
  const baseY = useMotionValue(0);
  const directionRef = useRef(1);
  const sequenceRef = useRef(null);
  const sequenceHeight = useElementHeight(sequenceRef);
  const reduceMotion = useReducedMotion();

  const y = useTransform(baseY, (value) => {
    if (!sequenceHeight) return "0px";
    return `${wrapOffset(-sequenceHeight, 0, value)}px`;
  });

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !activeRef.current) return;

    const currentVelocity = Math.max(-1800, Math.min(1800, rawScrollVelocity.get()));
    directionRef.current = resolveScrollDirection(currentVelocity, directionRef.current);
    baseY.set(
      baseY.get()
        + verticalScrollDisplacement({
          scrollVelocity: currentVelocity,
          deltaMs: Math.min(delta, 40),
          velocity,
          columnIndex,
          direction: directionRef.current,
        }),
    );
  });

  return (
    <div className="vertical-project-marquee__column">
      <motion.div className="vertical-project-marquee__track" style={{ y }}>
        {Array.from({ length: numCopies }, (_, copyIndex) => (
          <div
            aria-hidden={copyIndex > 0 ? "true" : undefined}
            className="vertical-project-marquee__sequence"
            key={copyIndex}
            ref={copyIndex === 0 ? sequenceRef : null}
          >
            {images.map((image) => (
              <MarqueeImage image={image} key={`${copyIndex}-${image.src}`} />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function VerticalProjectMarquee({
  images = [],
  statement,
  velocity = 18,
  numCopies = 2,
}) {
  const rootRef = useRef(null);
  const { activeRef } = useMotionActivity(rootRef);
  const { scrollY } = useScroll();
  const rawScrollVelocity = useVelocity(scrollY);
  const columns = useMemo(
    () => Array.from({ length: 4 }, (_, columnIndex) => {
      if (images.length === 0) return [];
      return Array.from(
        { length: Math.min(4, images.length) },
        (_, imageIndex) => images[(columnIndex * 2 + imageIndex) % images.length],
      );
    }),
    [images],
  );

  return (
    <section
      ref={rootRef}
      id="process-marquee"
      className="vertical-project-marquee"
      data-continuous-motion="managed"
      data-vertical-project-marquee="true"
      aria-label="项目画板纵向跑马灯"
    >
      <div className="vertical-project-marquee__cap is-top" aria-hidden="true" />
      <div className="vertical-project-marquee__window">
        <div className="vertical-project-marquee__columns" aria-hidden="true">
          {columns.map((columnImages, columnIndex) => (
            <VerticalColumn
              activeRef={activeRef}
              columnIndex={columnIndex}
              images={columnImages}
              key={columnIndex}
              numCopies={numCopies}
              rawScrollVelocity={rawScrollVelocity}
              velocity={velocity}
            />
          ))}
        </div>
        <div className="vertical-project-marquee__scrim" aria-hidden="true" />
        <div className="vertical-project-marquee__statement">
          <span>AI × DESIGN / POSITION</span>
          <p>{statement}</p>
        </div>
      </div>
      <div className="vertical-project-marquee__cap is-bottom" aria-hidden="true" />
    </section>
  );
}
