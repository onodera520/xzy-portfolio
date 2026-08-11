import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import "./PillNav.css";
import { getPillLayoutSize } from "../lib/pillGeometry.js";

const MOBILE_MENU_ID = "pill-nav-mobile-menu";

export default function PillNav({
  items,
  activeHref,
  ease = "power3.out",
  className = "",
  initialLoadAnimation = true,
  frameless = false,
  baseColor = "#000000",
  pillColor = "transparent",
  hoveredPillTextColor = "#ffffff",
  pillTextColor = "#000000",
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const timelineRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const desktopRef = useRef(null);
  const toggleRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const layout = () => {
      if (cancelled) return;
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const { width, height } = getPillLayoutSize(pill);
        if (!width || !height) return;

        const radius = (((width * width) / 4) + (height * height)) / (2 * height);
        const diameter = Math.ceil(2 * radius) + 2;
        const delta = Math.ceil(radius - Math.sqrt(Math.max(0, (radius * radius) - ((width * width) / 4)))) + 1;
        const originY = diameter - delta;
        Object.assign(circle.style, {
          width: `${diameter}px`,
          height: `${diameter}px`,
          bottom: `-${delta}px`,
        });

        const label = pill.querySelector(".pill-label");
        const hoverLabel = pill.querySelector(".pill-label-hover");
        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });
        gsap.set(label, { y: 0 });
        gsap.set(hoverLabel, { y: Math.ceil(height + 100), opacity: 0 });

        timelineRefs.current[index]?.kill();
        timelineRefs.current[index] = gsap.timeline({ paused: true })
          .to(circle, {
            scale: 1.2,
            xPercent: -50,
            duration: reducedMotion ? 0 : 2,
            ease,
            overwrite: "auto",
          }, 0)
          .to(label, { y: -(height + 8), duration: reducedMotion ? 0 : 2, ease, overwrite: "auto" }, 0)
          .to(hoverLabel, { y: 0, opacity: 1, duration: reducedMotion ? 0 : 2, ease, overwrite: "auto" }, 0);
      });
    };

    layout();
    window.addEventListener("resize", layout);
    document.fonts?.ready.then(layout).catch(() => undefined);

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (initialLoadAnimation && desktopRef.current && !reducedMotion) {
      gsap.fromTo(
        desktopRef.current,
        { opacity: 0, y: -10, scaleX: 0.86, transformOrigin: "right center" },
        { opacity: 1, y: 0, scaleX: 1, duration: 0.6, ease },
      );
    } else if (desktopRef.current) {
      gsap.set(desktopRef.current, { opacity: 1, y: 0, scaleX: 1 });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", layout);
      timelineRefs.current.forEach((timeline) => timeline?.kill());
      activeTweenRefs.current.forEach((tween) => tween?.kill());
      gsap.killTweensOf([desktopRef.current, toggleRef.current, mobileMenuRef.current]);
    };
  }, [ease, initialLoadAnimation, items]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const menu = mobileMenuRef.current;
    const toggle = toggleRef.current;
    if (!menu || !toggle) return undefined;

    const lines = toggle.querySelectorAll(".pill-nav-toggle-line");
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    gsap.to(lines[0], { rotation: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 3 : 0, duration: reducedMotion ? 0 : 0.2, ease });
    gsap.to(lines[1], { rotation: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -3 : 0, duration: reducedMotion ? 0 : 0.2, ease });
    gsap.to(menu, {
      autoAlpha: isMobileMenuOpen ? 1 : 0,
      y: isMobileMenuOpen ? 0 : 10,
      duration: reducedMotion ? 0.18 : (isMobileMenuOpen ? 0.24 : 0.16),
      ease,
      pointerEvents: isMobileMenuOpen ? "auto" : "none",
    });

    return () => {
      gsap.killTweensOf(lines);
      gsap.killTweensOf(menu);
    };
  }, [ease, isMobileMenuOpen]);

  const playTo = (index, end, immediate = false) => {
    const timeline = timelineRefs.current[index];
    if (!timeline) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = timeline.tweenTo(end ? timeline.duration() : 0, {
      duration: immediate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? 0
        : end ? 0.3 : 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": pillTextColor,
  };

  return (
    <nav
      className={`pill-nav${frameless ? " pill-nav--frameless" : ""}${className ? ` ${className}` : ""}`}
      aria-label="主导航"
      style={cssVars}
    >
      <div className="pill-nav-desktop" ref={desktopRef}>
        <ul className="pill-list">
          {items.map((item, index) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="pill"
                aria-label={item.ariaLabel ?? item.label}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") playTo(index, true);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType !== "touch") playTo(index, false);
                }}
                onFocus={() => playTo(index, true, true)}
                onBlur={() => playTo(index, false, true)}
              >
                <span
                  className="pill-hover-circle"
                  aria-hidden="true"
                  ref={(element) => { circleRefs.current[index] = element; }}
                />
                <span className="pill-label-stack">
                  <span className="pill-label">{item.label}</span>
                  <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <button
        ref={toggleRef}
        className="pill-nav-toggle"
        type="button"
        aria-label={isMobileMenuOpen ? "关闭导航菜单" : "打开导航菜单"}
        aria-expanded={isMobileMenuOpen}
        aria-controls={MOBILE_MENU_ID}
        onClick={() => setIsMobileMenuOpen((open) => !open)}
      >
        <span className="pill-nav-toggle-line" />
        <span className="pill-nav-toggle-line" />
      </button>

      <div
        ref={mobileMenuRef}
        id={MOBILE_MENU_ID}
        className="pill-nav-mobile-menu"
        aria-hidden={!isMobileMenuOpen}
      >
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={activeHref === item.href ? "is-active" : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
