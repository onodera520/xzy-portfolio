import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import "./FlowingMenu.css";

function distanceSquared(x, y, x2, y2) {
  const xDifference = x - x2;
  const yDifference = y - y2;
  return (xDifference * xDifference) + (yDifference * yDifference);
}

function findClosestEdge(mouseX, mouseY, width, height) {
  const topDistance = distanceSquared(mouseX, mouseY, width / 2, 0);
  const bottomDistance = distanceSquared(mouseX, mouseY, width / 2, height);
  return topDistance < bottomDistance ? "top" : "bottom";
}

function FlowingMenuItem({
  item,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
}) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const loopAnimationRef = useRef(null);
  const revealTimelineRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  useEffect(() => {
    const calculateRepetitions = () => {
      const firstPart = marqueeInnerRef.current?.querySelector(".flowing-menu__marquee-part");
      if (!firstPart || firstPart.offsetWidth === 0) return;

      const needed = Math.ceil(window.innerWidth / firstPart.offsetWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [item.text, item.image]);

  useEffect(() => {
    const setupMarquee = () => {
      const firstPart = marqueeInnerRef.current?.querySelector(".flowing-menu__marquee-part");
      if (!firstPart || !marqueeInnerRef.current || firstPart.offsetWidth === 0) return;

      loopAnimationRef.current?.kill();
      loopAnimationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -firstPart.offsetWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    const timer = window.setTimeout(setupMarquee, 50);
    return () => {
      window.clearTimeout(timer);
      loopAnimationRef.current?.kill();
      loopAnimationRef.current = null;
    };
  }, [item.text, item.image, repetitions, speed]);

  useEffect(() => () => {
    revealTimelineRef.current?.kill();
  }, []);

  const revealMarquee = (edge) => {
    if (!marqueeRef.current || !marqueeInnerRef.current) return;

    revealTimelineRef.current?.kill();
    revealTimelineRef.current = gsap
      .timeline({ defaults: { duration: 0.6, ease: "expo" } })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const hideMarquee = (edge) => {
    if (!marqueeRef.current || !marqueeInnerRef.current) return;

    revealTimelineRef.current?.kill();
    revealTimelineRef.current = gsap
      .timeline({ defaults: { duration: 0.6, ease: "expo" } })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  const getPointerEdge = (event) => {
    const rectangle = itemRef.current?.getBoundingClientRect();
    if (!rectangle) return "bottom";
    return findClosestEdge(
      event.clientX - rectangle.left,
      event.clientY - rectangle.top,
      rectangle.width,
      rectangle.height,
    );
  };

  const interactiveProps = {
    className: `flowing-menu__link${item.disabled ? " is-disabled" : ""}`,
    onMouseEnter: (event) => revealMarquee(getPointerEdge(event)),
    onMouseLeave: (event) => hideMarquee(getPointerEdge(event)),
    onFocus: () => revealMarquee("bottom"),
    onBlur: () => hideMarquee("bottom"),
    style: { color: textColor },
  };

  return (
    <div
      className="flowing-menu__item"
      data-project={item.slug}
      ref={itemRef}
      style={{ borderColor }}
    >
      {item.disabled ? (
        <span {...interactiveProps} aria-disabled="true" tabIndex="0">
          {item.text}
        </span>
      ) : (
        <a {...interactiveProps} href={item.link}>
          {item.text}
        </a>
      )}

      <div
        aria-hidden="true"
        className="flowing-menu__marquee"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className="flowing-menu__marquee-viewport">
          <div className="flowing-menu__marquee-inner" ref={marqueeInnerRef}>
            {Array.from({ length: repetitions }, (_, index) => (
              <div
                className="flowing-menu__marquee-part"
                key={`${item.slug}-${index}`}
                style={{ color: marqueeTextColor }}
              >
                <span>{item.text}</span>
                <div
                  className="flowing-menu__image"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlowingMenu({
  items = [],
  speed = 15,
  textColor = "#ffffff",
  bgColor = "#120f17",
  marqueeBgColor = "#ffffff",
  marqueeTextColor = "#120f17",
  borderColor = "#ffffff",
}) {
  return (
    <div className="flowing-menu" style={{ backgroundColor: bgColor }}>
      <nav className="flowing-menu__nav" aria-label="其他项目">
        {items.map((item) => (
          <FlowingMenuItem
            borderColor={borderColor}
            item={item}
            key={item.slug}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            speed={speed}
            textColor={textColor}
          />
        ))}
      </nav>
    </div>
  );
}
