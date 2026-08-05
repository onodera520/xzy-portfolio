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

      <div className={`demo-viewport${url ? " is-live" : ""}`}>
        {url ? (
          <iframe
            src={url}
            title={title}
            loading="lazy"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
          />
        ) : (
          <>
            <Poster poster={poster} />
            <div className="demo-placeholder-copy">
              <span className="demo-status"><i /> DEMO SLOT RESERVED</span>
              <strong>{title}</strong>
              <p>完成交互 Demo 后，只需补充网址即可在这里直接体验。</p>
            </div>
          </>
        )}
      </div>

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
