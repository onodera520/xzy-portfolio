import BlurText from "./BlurText.jsx";
import FadeContent from "./FadeContent.jsx";
import ScrollReveal from "./ScrollReveal.jsx";
import SpotlightCard from "./SpotlightCard.jsx";
import DriftWall from "./DriftWall.jsx";
import { designProcess } from "../data/designProcess.js";

import "./DesignProcess.css";

function EvidenceImage({ image }) {
  return (
    <picture className="process-evidence__media">
      <source media="(max-width: 767px)" srcSet={image.mobile} />
      <img
        className="process-evidence__image"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: image.objectPosition }}
      />
    </picture>
  );
}

export default function DesignProcess() {
  return (
    <section
      className="ai-section process-board section"
      id="process"
      data-brand-region="true"
      data-brand-contrast="dark"
    >
      <div className="shell process-board__shell">
        <div className="section-index process-board__eyebrow">{designProcess.eyebrow}</div>
        <div className="process-board__heading">
          <BlurText as="h2" text={designProcess.title} />
          <ScrollReveal
            baseOpacity={0.18}
            enableBlur
            baseRotation={1}
            blurStrength={3}
          >
            {designProcess.introduction}
          </ScrollReveal>
        </div>

        <div className="process-steps" aria-label="五步设计工作流">
          {designProcess.steps.map((step, index) => (
            <FadeContent
              className="home-reveal process-step-reveal"
              delay={0.025 * index}
              key={step.number}
            >
              <SpotlightCard className="process-step-card">
                <article data-process-step={step.number}>
                  <header>
                    <span>{step.number}</span>
                    <h3>{step.title}</h3>
                  </header>
                  <dl>
                    <div>
                      <dt>AI 参与</dt>
                      <dd>{step.aiRole}</dd>
                    </div>
                    <div>
                      <dt>我的判断</dt>
                      <dd>{step.designerRole}</dd>
                    </div>
                  </dl>
                </article>
              </SpotlightCard>
            </FadeContent>
          ))}
        </div>

        <div className="process-evidence__heading">
          <span>PROJECT PROOF / 真实项目证据</span>
          <h3>让方法在真实约束中成立</h3>
        </div>

        <div className="process-evidence-grid">
          {designProcess.evidence.map((item, index) => (
            <FadeContent
              className="home-reveal process-evidence-reveal"
              delay={0.04 * index}
              key={item.slug}
            >
              <SpotlightCard
                className="process-evidence-card"
                spotlightColor={`${item.accent}29`}
              >
                <a
                  href={item.link}
                  data-process-evidence={item.slug}
                  aria-label={`查看${item.title}案例`}
                  style={{ "--process-accent": item.accent }}
                >
                  <div className={`process-evidence__visual${item.images.length > 1 ? " is-dual" : ""}`}>
                    {item.images.map((image) => <EvidenceImage image={image} key={image.src} />)}
                  </div>
                  <div className="process-evidence__copy">
                    <p className="process-evidence__label">{item.label}</p>
                    <div className="process-evidence__title-row">
                      <h3>{item.title}</h3>
                      <span aria-hidden="true">↗</span>
                    </div>
                    <dl>
                      <div><dt>AI 参与</dt><dd>{item.aiRole}</dd></div>
                      <div><dt>我的判断</dt><dd>{item.designerRole}</dd></div>
                    </dl>
                    <p className="process-evidence__outcome"><span>结果</span>{item.outcome}</p>
                  </div>
                </a>
              </SpotlightCard>
            </FadeContent>
          ))}
        </div>

      </div>
      <DriftWall
        images={designProcess.marqueeImages}
        columns={5}
        speed={40}
        variance={0.45}
        tilt={0}
        turn={0}
        roll={0}
        perspective={1000}
        depth={130}
        parallax={1}
        overlay="#000000"
        gap={12}
        radius={16}
        lift={76}
        fade={0.6}
        dim={0.8}
        grayscale
        pauseOnHover
      />
    </section>
  );
}
