import { useEffect, useMemo, useRef, useState } from "react";

import LineSidebar from "./LineSidebar.jsx";

const MOBILE_QUERY = "(max-width: 767px)";
const HIDE_DELAY = 500;
const CHAPTER_NAV_PALETTES = {
  consumer: {
    accentColor: "#006cff",
    textColor: "#31506b",
    markerColor: "#6b91ac",
  },
  enterprise: {
    accentColor: "#6ea8ff",
    textColor: "#aab8d6",
    markerColor: "#50658c",
  },
  campaign: {
    accentColor: "#FF8F96",
    textColor: "#D98286",
    markerColor: "#B86568",
  },
};

export function shouldShowChapterNav({ isMobile, isScrolling, isHovered, isFocused }) {
  return isMobile ? isScrolling : isScrolling || isHovered || isFocused;
}

export function getCaseFrameId(projectSlug, index) {
  return `case-frame-${projectSlug}-${index + 1}`;
}

export function CaseChapterNav({ projectSlug, frames }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hideTimerRef = useRef(null);
  const titles = useMemo(() => frames.map((frame) => frame.title), [frames]);
  const isVisible = shouldShowChapterNav({ isMobile, isScrolling, isHovered, isFocused });
  const isEnterprise = projectSlug === "enterprise";
  const isCampaign = projectSlug === "campaign";
  const palette = CHAPTER_NAV_PALETTES[projectSlug] ?? CHAPTER_NAV_PALETTES.consumer;

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updateMode = () => setIsMobile(mediaQuery.matches);

    updateMode();
    mediaQuery.addEventListener("change", updateMode);
    return () => mediaQuery.removeEventListener("change", updateMode);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        hideTimerRef.current = null;
      }, HIDE_DELAY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const elements = frames
      .map((_, index) => document.getElementById(getCaseFrameId(projectSlug, index)))
      .filter(Boolean);
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current) setActiveIndex(Number(current.target.dataset.caseFrameIndex));
      },
      { rootMargin: "-24% 0px -68% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [frames, projectSlug]);

  const handleItemClick = (index) => {
    setActiveIndex(index);
    document.getElementById(getCaseFrameId(projectSlug, index))?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const activeFrame = frames[activeIndex] ?? frames[0];

  return (
    <aside
      className={`case-chapter-nav${isVisible ? " is-visible" : ""}${isEnterprise ? " is-enterprise" : ""}${isCampaign ? " is-campaign" : ""}`}
      aria-label="作品集章节"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
    >
      <div className="case-chapter-nav__content">
        {isMobile ? (
          <div className="case-chapter-nav__mobile" aria-live="polite">
            <span>{activeFrame?.number}</span>
            <strong>{activeFrame?.title}</strong>
          </div>
        ) : (
          <LineSidebar
            className="case-chapter-nav__desktop"
            items={titles}
            activeIndex={activeIndex}
            accentColor={palette.accentColor}
            textColor={palette.textColor}
            markerColor={palette.markerColor}
            proximityRadius={76}
            maxShift={14}
            markerLength={42}
            tickScale={0.38}
            itemGap={10}
            fontSize={0.78}
            smoothing={120}
            onItemClick={handleItemClick}
          />
        )}
      </div>
    </aside>
  );
}
