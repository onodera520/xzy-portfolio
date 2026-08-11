import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import "./StaggeredMenu.css";

const DEFAULT_COLORS = ["#0B0B0B", "#454541", "#C8C6BF"];
const prefersReducedMotion = () => (
  typeof window !== "undefined"
  && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false)
);

export default function StaggeredMenu({
  position = "left",
  colors = DEFAULT_COLORS,
  panelColor = "#F7F6F2",
  groups = [],
  statusText = "",
  triggerTone = "dark",
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
  motionProfile,
}) {
  const appleMotion = motionProfile === "apple";
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const iconRef = useRef(null);
  const lineRefs = useRef([]);
  const timelineRef = useRef(null);
  const closeTweenRef = useRef(null);
  const iconTweenRef = useRef(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    if (!panel) return undefined;

    const preLayers = preContainer
      ? Array.from(preContainer.querySelectorAll(".sm-prelayer"))
      : [];
    const offscreen = position === "left" ? -100 : 100;
    preLayerElsRef.current = preLayers;

    const context = gsap.context(() => {
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      gsap.set(iconRef.current, { transformOrigin: "50% 50%" });
    }, rootRef);

    return () => context.revert();
  }, [position, colors]);

  const animateTrigger = useCallback((opening) => {
    const [first, middle, last] = lineRefs.current;
    if (!first || !middle || !last) return;
    const reducedMotion = prefersReducedMotion();

    iconTweenRef.current?.kill();
    iconTweenRef.current = gsap.timeline({ defaults: { overwrite: "auto" } })
      .to(first, {
        y: opening ? 10 : 0,
        rotate: opening ? 45 : 0,
        duration: reducedMotion ? 0 : appleMotion ? (opening ? 0.24 : 0.16) : (opening ? 0.55 : 0.32),
        ease: appleMotion ? "power3.out" : (opening ? "power4.out" : "power3.inOut"),
      }, 0)
      .to(middle, {
        opacity: opening ? 0 : 1,
        scaleX: opening ? 0.3 : 1,
        duration: reducedMotion ? 0 : appleMotion ? 0.16 : 0.26,
        ease: "power2.out",
      }, 0)
      .to(last, {
        y: opening ? -10 : 0,
        rotate: opening ? -45 : 0,
        duration: reducedMotion ? 0 : appleMotion ? (opening ? 0.24 : 0.16) : (opening ? 0.55 : 0.32),
        ease: appleMotion ? "power3.out" : (opening ? "power4.out" : "power3.inOut"),
      }, 0);
  }, [appleMotion]);

  const playOpen = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;
    const reducedMotion = prefersReducedMotion();

    timelineRef.current?.kill();
    closeTweenRef.current?.kill();

    const groupElements = Array.from(panel.querySelectorAll(".sm-menu-group"));
    const status = panel.querySelector(".sm-menu-status");
    const offscreen = position === "left" ? -100 : 100;
    gsap.set(groupElements, { y: 34, opacity: 0 });
    if (status) gsap.set(status, { y: 18, opacity: 0 });

    const timeline = gsap.timeline({ paused: true });
    layers.forEach((layer, index) => {
      timeline.fromTo(
        layer,
        { xPercent: offscreen },
        { xPercent: 0, duration: reducedMotion ? 0 : appleMotion ? 0.22 : 0.5, ease: appleMotion ? "power3.out" : "power4.out" },
        index * (appleMotion ? 0.04 : 0.07),
      );
    });

    const panelStart = Math.max(appleMotion ? 0.04 : 0.08, layers.length * (appleMotion ? 0.04 : 0.07));
    timeline.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: reducedMotion ? 0 : appleMotion ? 0.26 : 0.65, ease: appleMotion ? "power3.out" : "power4.out" },
      panelStart,
    );
    timeline.to(
      groupElements,
      {
        y: 0,
        opacity: 1,
        duration: reducedMotion ? 0 : appleMotion ? 0.24 : 0.72,
        ease: appleMotion ? "power3.out" : "power4.out",
        stagger: { each: appleMotion ? 0.04 : 0.08, from: "start" },
      },
      panelStart + 0.12,
    );
    if (status) {
      timeline.to(
        status,
        { y: 0, opacity: 1, duration: reducedMotion ? 0 : appleMotion ? 0.2 : 0.45, ease: "power3.out" },
        panelStart + 0.42,
      );
    }
    timeline.eventCallback("onComplete", () => {
      panel.querySelector(".sm-group-heading")?.focus({ preventScroll: true });
    });

    timelineRef.current = timeline;
    timeline.play(0);
  }, [appleMotion, position]);

  const playClose = useCallback((restoreFocus = true) => {
    const panel = panelRef.current;
    if (!panel) return;
    const reducedMotion = prefersReducedMotion();

    timelineRef.current?.kill();
    closeTweenRef.current?.kill();
    const offscreen = position === "left" ? -100 : 100;
    closeTweenRef.current = gsap.to([...preLayerElsRef.current, panel], {
      xPercent: offscreen,
      duration: reducedMotion ? 0 : appleMotion ? 0.18 : 0.34,
      ease: appleMotion ? "power3.out" : "power3.in",
      overwrite: "auto",
      onComplete: () => {
        if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
      },
    });
  }, [appleMotion, position]);

  const closeMenu = useCallback((restoreFocus = true) => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    animateTrigger(false);
    playClose(restoreFocus);
    onMenuClose?.();
  }, [animateTrigger, onMenuClose, playClose]);

  const toggleMenu = useCallback(() => {
    if (openRef.current) {
      closeMenu();
      return;
    }

    openRef.current = true;
    setOpen(true);
    animateTrigger(true);
    playOpen();
    onMenuOpen?.();
  }, [animateTrigger, closeMenu, onMenuOpen, playOpen]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, open]);

  useEffect(() => () => {
    timelineRef.current?.kill();
    closeTweenRef.current?.kill();
    iconTweenRef.current?.kill();
  }, []);

  return (
    <div
      ref={rootRef}
      className="staggered-menu-root"
      data-motion-profile={appleMotion ? "apple" : undefined}
      data-position={position}
      data-open={open || undefined}
    >
      <button
        ref={triggerRef}
        className={`sm-menu-trigger sm-trigger-${triggerTone}`}
        type="button"
        aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
        aria-expanded={open}
        aria-controls="staggered-menu-panel"
        onClick={toggleMenu}
      >
        <span ref={iconRef} className="sm-trigger-icon" aria-hidden="true">
          {[0, 1, 2].map((line) => (
            <span
              className="sm-trigger-line"
              key={line}
              ref={(element) => { lineRefs.current[line] = element; }}
            />
          ))}
        </span>
      </button>

      <div className="sm-menu-overlay" aria-hidden={!open}>
        {closeOnClickAway && (
          <button
            className="sm-menu-backdrop"
            type="button"
            tabIndex={-1}
            aria-label="关闭导航菜单"
            onClick={() => closeMenu()}
          />
        )}
        <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
          {(colors.length ? colors : DEFAULT_COLORS).slice(0, 4).map((color, index) => (
            <div className="sm-prelayer" key={`${color}-${index}`} style={{ backgroundColor: color }} />
          ))}
        </div>

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel"
          aria-hidden={!open}
          inert={open ? undefined : true}
          style={{ backgroundColor: panelColor }}
        >
          <nav className="sm-menu-nav" aria-label="作品集完整导航">
            <ul className="sm-menu-groups" role="list">
              {groups.map((group) => (
                <li className="sm-menu-group" key={group.title}>
                  <a
                    className="sm-group-heading"
                    href={group.link}
                    aria-label={group.ariaLabel}
                    onClick={() => closeMenu(false)}
                  >
                    <img
                      className="sm-heading-bee"
                      src="/hero/design-in-bloom/bee.png"
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      width="44"
                      height="44"
                    />
                    <span>{group.title}</span>
                    <small>/ {group.titleZh}</small>
                  </a>
                  <ul className="sm-child-list" role="list">
                    {group.children.map((item) => (
                      <li key={item.label}>
                        {item.disabled ? (
                          <span className="sm-child-link is-disabled" aria-disabled="true">
                            {item.label}
                          </span>
                        ) : (
                          <a
                            className="sm-child-link"
                            href={item.link}
                            onClick={() => closeMenu(false)}
                          >
                            {item.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
          {statusText && <p className="sm-menu-status">{statusText}</p>}
        </aside>
      </div>
    </div>
  );
}
