import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import "./AccordionGallery.css";
import {
  calculateAccordionLayout,
  shouldShowAccordionLabel,
} from "../lib/accordionLayout.js";

export default function AccordionGallery({
  items,
  accentColor = "#b8ff68",
  overlayColor = "#060a0c",
  textColor = "#ffffff",
  height = 520,
  gap = 14,
  radius = 24,
  expandRatio = 0.52,
  orientation = "horizontal",
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 6,
  stagger = 0.06,
  trigger = "hover",
  grayscale = true,
  className = "",
}) {
  const rootRef = useRef(null);
  const panelRefs = useRef([]);
  const mediaRefs = useRef([]);
  const labelRefs = useRef([]);
  const timelineRef = useRef(null);
  const firstRunRef = useRef(true);
  const [active, setActive] = useState(null);
  const [compact, setCompact] = useState(false);

  const count = items.length;
  const vertical = orientation === "vertical" || compact;

  const applyLayout = useCallback((animate) => {
    const element = rootRef.current;
    const panels = panelRefs.current;
    if (!element || !panels.length) return;

    const hasActive = Number.isInteger(active);
    const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
    const grow = count > 1 ? (ratio * (count - 1)) / (1 - ratio) : 1;
    const rect = element.getBoundingClientRect();
    const horizontalLayout = vertical
      ? null
      : calculateAccordionLayout({
          width: rect.width,
          height,
          count,
          gap,
          activeIndex: active,
        });
    const verticalUsableSize = Math.max(rect.height - (gap * (count - 1)), 120);
    const mediaSize = horizontalLayout
      ? horizontalLayout.activeWidth
      : Math.max(140, verticalUsableSize * ratio * 1.22);
    const galleryHeight = vertical ? Math.round(height * 1.08) : horizontalLayout.galleryHeight;
    const animationDuration = animate ? duration : 0;

    if (Math.abs(rect.height - galleryHeight) > 0.5) {
      element.style.height = `${galleryHeight}px`;
    }
    element.style.setProperty("--ag-media-size", `${mediaSize}px`);

    timelineRef.current?.kill();
    const timeline = gsap.timeline();

    panels.forEach((panel, index) => {
      if (!panel) return;

      const isActive = hasActive && index === active;
      const media = mediaRefs.current[index];
      const label = labelRefs.current[index];
      const rotation = !hasActive || isActive ? 0 : index < active ? tilt : -tilt;
      const rotationProps = vertical ? { rotateX: -rotation, rotateY: 0 } : { rotateX: 0, rotateY: rotation };

      timeline.to(
        panel,
        vertical
          ? {
              flexBasis: "0px",
              flexGrow: isActive ? grow : 1,
              flexShrink: 1,
              ...rotationProps,
              duration: animationDuration,
              ease,
            }
          : {
              flexBasis: `${horizontalLayout.panelWidths[index]}px`,
              flexGrow: 0,
              flexShrink: 0,
              ...rotationProps,
              duration: animationDuration,
              ease,
            },
        0,
      );

      if (media) {
        const drift = hasActive ? Math.max(-1.5, Math.min(1.5, active - index)) : 0;
        const shift = drift * parallax * mediaSize * 0.06;
        const gray = grayscale && !isActive ? 1 : 0;

        timeline.to(
          media,
          {
            xPercent: -50,
            yPercent: -50,
            x: vertical ? 0 : shift,
            y: vertical ? shift : 0,
            "--ag-gray": gray,
            "--ag-dim": hasActive ? (isActive ? 0 : 0.38) : 0.16,
            duration: animationDuration,
            ease,
          },
          0,
        );
      }

      if (label) {
        const textWidth = label.querySelector(".ag-panel__text")?.scrollWidth ?? 0;
        const statusWidth = label.querySelector(".ag-panel__status")?.scrollWidth ?? 0;
        const contentWidth = Math.max(textWidth, statusWidth);
        const showLabel = vertical || shouldShowAccordionLabel({
          hasActive,
          isActive,
          panelWidth: horizontalLayout.panelWidths[index],
          contentWidth,
        });

        timeline.to(
          label,
          {
            opacity: showLabel ? (!hasActive || isActive ? 1 : 0.48) : 0,
            x: 0,
            y: showLabel ? 0 : 10,
            duration: animationDuration,
            ease,
          },
          index * (animate ? stagger * 0.18 : 0),
        );
      }
    });

    timelineRef.current = timeline;
  }, [active, count, duration, ease, expandRatio, gap, grayscale, height, parallax, stagger, tilt, vertical]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 520px)");
    const updateCompact = () => setCompact(query.matches);
    updateCompact();
    query.addEventListener("change", updateCompact);
    return () => query.removeEventListener("change", updateCompact);
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return undefined;

    const measure = () => {
      applyLayout(!firstRunRef.current);
      firstRunRef.current = false;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [applyLayout]);

  useEffect(() => () => timelineRef.current?.kill(), []);

  const handleClick = (index, event, hasLink) => {
    if (active !== index || !hasLink) {
      event.preventDefault();
      setActive(index);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index + 1) % count);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index - 1 + count) % count);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? " accordion-gallery--vertical" : ""}${className ? ` ${className}` : ""}`}
      style={{
        "--ag-accent": accentColor,
        "--ag-overlay": overlayColor,
        "--ag-text": textColor,
        "--ag-gap": `${gap}px`,
        "--ag-radius": `${radius}px`,
        height: `${vertical ? Math.round(height * 1.08) : height}px`,
      }}
      role="list"
      aria-label="作品案例"
      onMouseLeave={() => setActive(null)}
    >
      {items.map((item, index) => {
        const isActive = index === active;
        const Tag = item.link ? "a" : "button";

        return (
          <Tag
            key={item.label}
            ref={(element) => { panelRefs.current[index] = element; }}
            className={`ag-panel${isActive ? " ag-panel--active" : ""}`}
            href={item.link || undefined}
            type={item.link ? undefined : "button"}
            onClick={(event) => handleClick(index, event, Boolean(item.link))}
            onMouseEnter={() => { if (trigger === "hover") setActive(index); }}
            onFocus={() => setActive(index)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            role="listitem"
            aria-current={isActive ? "true" : undefined}
            aria-label={item.status ? `${item.label}，${item.status}` : item.label}
          >
            <span className="ag-panel__frame">
              <span
                className="ag-panel__media"
                ref={(element) => { mediaRefs.current[index] = element; }}
              >
                <img
                  src={item.image}
                  alt={item.alt || ""}
                  draggable="false"
                  loading="lazy"
                  decoding="async"
                  width="1920"
                  height="1080"
                />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            <span
              className="ag-panel__label"
              ref={(element) => { labelRefs.current[index] = element; }}
              aria-hidden="true"
            >
              <span className="ag-panel__bar" />
              <span>
                <strong className="ag-panel__text">{item.label}</strong>
                {item.status && <small className="ag-panel__status">{item.status}</small>}
              </span>
            </span>
          </Tag>
        );
      })}
    </div>
  );
}
