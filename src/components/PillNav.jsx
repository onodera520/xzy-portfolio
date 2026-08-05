import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import "./PillNav.css";

const MOBILE_MENU_ID = "pill-nav-mobile-menu";

export default function PillNav({
  items,
  activeHref,
  ease = "power3.out",
  className = "",
  initialLoadAnimation = true,
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

      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const { width, height } = pill.getBoundingClientRect();
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
        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });
        gsap.set(label, { y: 0 });
        gsap.set(hoverLabel, { y: Math.ceil(height + 32), opacity: 0 });

        timelineRefs.current[index]?.kill();
        timelineRefs.current[index] = gsap.timeline({ paused: true })
          .to(circle, { scale: 1.2, xPercent: -50, duration: 1, ease, overwrite: "auto" }, 0)
          .to(label, { y: -(height + 8), duration: 1, ease, overwrite: "auto" }, 0)
          .to(hoverLabel, { y: 0, opacity: 1, duration: 1, ease, overwrite: "auto" }, 0);
      });
    };

    layout();
    window.addEventListener("resize", layout);
    document.fonts?.ready.then(layout).catch(() => undefined);

    if (initialLoadAnimation && desktopRef.current) {
      gsap.fromTo(
        desktopRef.current,
        { opacity: 0, y: -10, scaleX: 0.86, transformOrigin: "right center" },
        { opacity: 1, y: 0, scaleX: 1, duration: 0.65, ease },
      );
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
    gsap.to(lines[0], { rotation: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 3 : 0, duration: 0.28, ease });
    gsap.to(lines[1], { rotation: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -3 : 0, duration: 0.28, ease });
    gsap.to(menu, {
      autoAlpha: isMobileMenuOpen ? 1 : 0,
      y: isMobileMenuOpen ? 0 : 10,
      duration: isMobileMenuOpen ? 0.3 : 0.2,
      ease,
      pointerEvents: isMobileMenuOpen ? "auto" : "none",
    });

    return () => {
      gsap.killTweensOf(lines);
      gsap.killTweensOf(menu);
    };
  }, [ease, isMobileMenuOpen]);

  const playTo = (index, end) => {
    const timeline = timelineRefs.current[index];
    if (!timeline) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = timeline.tweenTo(end ? timeline.duration() : 0, {
      duration: end ? 0.32 : 0.22,
      ease,
      overwrite: "auto",
    });
  };

  return (
    <nav className={`pill-nav ${className}`.trim()} aria-label="主导航">
      <div className="pill-nav-desktop" ref={desktopRef}>
        <ul className="pill-list">
          {items.map((item, index) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`pill${activeHref === item.href ? " is-active" : ""}`}
                aria-label={item.ariaLabel ?? item.label}
                onMouseEnter={() => playTo(index, true)}
                onMouseLeave={() => playTo(index, false)}
                onFocus={() => playTo(index, true)}
                onBlur={() => playTo(index, false)}
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
