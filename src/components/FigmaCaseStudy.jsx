import { DemoEmbed } from "./DemoEmbed.jsx";
import { CaseOtherLink } from "./CaseOtherLink.jsx";
import { CaseChapterNav, getCaseFrameId } from "./CaseChapterNav.jsx";

function PortfolioBoard({ frame, priority }) {
  return (
    <section className="portfolio-board" data-figma-node={frame.nodeId}>
      <picture>
        <source media="(max-width: 767px)" srcSet={frame.board.mobile} />
        <img
          src={frame.board.src}
          alt={frame.board.alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          width={frame.board.width}
          height={frame.board.height}
        />
      </picture>
    </section>
  );
}

export function FigmaCaseStudy({ project, Navigation }) {
  return (
    <div className={`board-case board-case-${project.tone}`}>
      <Navigation inverted />
      <main>
        <div className="board-case-toolbar board-shell">
          <a href="/#work">← 返回作品</a>
          <span>{project.category} / {project.index}</span>
        </div>

        <div className="case-reader-layout board-shell">
          <CaseChapterNav projectSlug={project.slug} frames={project.frames} />

          <div className="portfolio-board-list">
            {project.frames.map((frame, index) => (
              <div
                className="portfolio-board-entry"
                id={getCaseFrameId(project.slug, index)}
                data-case-frame-index={index}
                key={frame.nodeId}
              >
                <PortfolioBoard frame={frame} priority={index === 0} />
                {index === 0 && project.demo && (
                  <div className="portfolio-board-demo">
                    <DemoEmbed {...project.demo} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <CaseOtherLink />
      </main>
    </div>
  );
}
