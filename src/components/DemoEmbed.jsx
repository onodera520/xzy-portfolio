import { useEffect, useRef, useState } from "react";

import { calculateDemoScale } from "../lib/demoScale.js";

const DEMO_CANVAS_WIDTH = 1920;
const DEMO_CANVAS_HEIGHT = 1200;

function Poster({ poster }) {
  if (!poster) return <div className="demo-grid" aria-hidden="true" />;

  return (
    <picture>
      {poster.mobile && <source media="(max-width: 767px)" srcSet={poster.mobile} />}
      <img
        src={poster.src}
        alt={poster.alt ?? "Demo 预览"}
        loading="lazy"
        decoding="async"
        width="1920"
        height="1080"
      />
    </picture>
  );
}

function ScaledDemo({ url, title }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const updateScale = ({ width, height }) => {
      const nextLayout = calculateDemoScale({
        viewportWidth: width,
        viewportHeight: height,
        canvasWidth: DEMO_CANVAS_WIDTH,
        canvasHeight: DEMO_CANVAS_HEIGHT,
      });

      setScale(nextLayout.scale);
      setIsMeasured(true);
    };

    updateScale(viewport.getBoundingClientRect());

    if (typeof ResizeObserver !== "function") return undefined;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateScale(entry.contentRect);
    });
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={viewportRef} className="demo-viewport is-live">
      <div
        className="demo-canvas"
        style={{
          width: `${DEMO_CANVAS_WIDTH}px`,
          height: `${DEMO_CANVAS_HEIGHT}px`,
          opacity: isMeasured ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <iframe
          src={url}
          title={title}
          loading="lazy"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}

export function DemoEmbed({ url, title, poster }) {
  return (
    <section className="demo-embed" aria-labelledby="demo-title">
      <div className="demo-heading">
        <div>
          <p>INTERACTIVE PROTOTYPE</p>
          <h2 id="demo-title">可交互 Demo</h2>
        </div>
        <span>16:10 / DESKTOP EXPERIENCE</span>
      </div>

      {url ? (
        <ScaledDemo url={url} title={title} />
      ) : (
        <div className="demo-viewport">
          <>
            <Poster poster={poster} />
            <div className="demo-placeholder-copy">
              <span className="demo-status"><i /> DEMO SLOT RESERVED</span>
              <strong>{title}</strong>
              <p>完成交互 Demo 后，只需补充网址即可在这里直接体验。</p>
            </div>
          </>
        </div>
      )}

      <div className="demo-footer">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer">在新窗口打开 ↗</a>
        ) : (
          <span>Demo 地址稍后补充</span>
        )}
      </div>
    </section>
  );
}
