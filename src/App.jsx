import { useEffect } from "react";

import { HomeMarquee } from "./components/HomeMarquee.jsx";
import AccordionGallery from "./components/AccordionGallery.jsx";
import { FigmaCaseStudy } from "./components/FigmaCaseStudy.jsx";
import { CaseOtherLink } from "./components/CaseOtherLink.jsx";
import BeeSwarmHero from "./components/BeeSwarmHero.jsx";
import BloomPhysicsExperience from "./components/BloomPhysicsExperience.jsx";
import OpeningBloom from "./components/OpeningBloom.jsx";
import BlurText from "./components/BlurText.jsx";
import FadeContent from "./components/FadeContent.jsx";
import SpecularButton from "./components/SpecularButton.jsx";
import PillNav from "./components/PillNav.jsx";
import EditorialAbout from "./components/EditorialAbout.jsx";
import StaggeredMenu from "./components/StaggeredMenu.jsx";
import ClickSpark from "./components/ClickSpark.jsx";
import DesignProcess from "./components/DesignProcess.jsx";
import { aboutProfile } from "./data/aboutProfile.js";
import { getProject, homeSectionIds, projectGalleryItems } from "./data/projects.js";
import { sidebarMenuGroups, sidebarStatusText } from "./data/sidebarMenu.js";
import { useBrandContrast } from "./hooks/useBrandContrast.js";

const SIDEBAR_LAYER_COLORS = ["#0B0B0B", "#454541", "#C8C6BF"];

export function scrollToSection(
  sectionId,
  documentRoot = typeof document === "undefined" ? null : document,
  behavior = "smooth",
) {
  const section = documentRoot?.getElementById(sectionId);
  if (!section) return false;

  section.scrollIntoView({ behavior, block: "start" });
  return true;
}

export function scrollHomeHash(
  hash,
  documentRoot = typeof document === "undefined" ? null : document,
) {
  if (typeof hash !== "string" || !hash.startsWith("#")) return false;

  let sectionId;
  try {
    sectionId = decodeURIComponent(hash.slice(1));
  } catch {
    return false;
  }

  if (!homeSectionIds.includes(sectionId)) return false;
  return scrollToSection(sectionId, documentRoot, "auto");
}

export function scheduleHomeHashScroll({
  windowRoot = typeof window === "undefined" ? null : window,
  documentRoot = typeof document === "undefined" ? null : document,
} = {}) {
  if (!windowRoot || !documentRoot) return () => {};

  let frameId = null;
  let active = true;

  const scrollAfterPaint = () => {
    if (!active) return;
    frameId = windowRoot.requestAnimationFrame(() => {
      if (!active) return;
      scrollHomeHash(windowRoot.location?.hash ?? "", documentRoot);
    });
  };

  const handleLoad = () => {
    windowRoot.removeEventListener("load", handleLoad);
    scrollAfterPaint();
  };

  if (documentRoot.readyState === "complete") {
    scrollAfterPaint();
  } else {
    windowRoot.addEventListener("load", handleLoad, { once: true });
  }

  return () => {
    active = false;
    windowRoot.removeEventListener("load", handleLoad);
    if (frameId !== null) windowRoot.cancelAnimationFrame(frameId);
  };
}

function Navigation({ homeLinks = false, inverted = false }) {
  const brandContrast = useBrandContrast({ defaultTheme: "light" });
  const anchor = homeLinks ? "#" : "/#";
  const items = [
    { label: "关于", href: `${anchor}about` },
    { label: "作品", href: `${anchor}work` },
    { label: "过程", href: `${anchor}process` },
    { label: "联系", href: `${anchor}contact` },
  ];

  return (
    <header
      className={`site-nav${inverted ? " site-nav-solid" : ""}`}
      data-brand-contrast={brandContrast}
    >
      <div className="nav-inner shell">
        <div className="nav-brand">
          <StaggeredMenu
            colors={SIDEBAR_LAYER_COLORS}
            groups={sidebarMenuGroups}
            panelColor="#F7F6F2"
            statusText={sidebarStatusText}
            triggerTone="inherit"
          />
          <a className="wordmark" href="/" aria-label="XUE STUDIO 作品集首页">XUE STUDIO</a>
        </div>
        <PillNav
          items={items}
          activeHref={homeLinks ? undefined : `${anchor}work`}
        />
        <div className="nav-actions">
          <a href={`${anchor}contact`} aria-label="查看简历信息">CV</a>
          <a href={`${anchor}contact`} aria-label="联系 XUE STUDIO" className="nav-mail">✉</a>
        </div>
      </div>
    </header>
  );
}

function MediaPlaceholder({ label, className = "" }) {
  return (
    <div className={`media-placeholder ${className}`} role="img" aria-label={label}>
      <span>{label}</span>
      <small>等待补充真实视频或图片</small>
    </div>
  );
}

function HomePage({ previousDocumentPath = null }) {
  useEffect(() => {
    return scheduleHomeHashScroll();
  }, []);

  return (
    <>
      <OpeningBloom
        flowerSrc="/hero/design-in-bloom/flower-sprite.png"
        previousDocumentPath={previousDocumentPath}
      />
      <Navigation homeLinks />
      <main className="home-page" data-brand-region="true" data-brand-contrast="light">
        <BloomPhysicsExperience
          flowerSrc="/hero/design-in-bloom/flower-sprite.png"
          burstCount={8}
          mobileBurstCount={5}
          maxFlowers={30}
          settleMs={10000}
          fadeMs={800}
        >
        <section className="hero" id="top">
          <div className="hero-stage shell">
            <BeeSwarmHero
              flowerSrc="/hero/design-in-bloom/flower.png"
              beeSrc="/hero/design-in-bloom/bee.png"
              count={10}
              mobileCount={6}
              idleSpread={[190, 330]}
              pointerSpread={[65, 105]}
              speed={2.5}
              trailLength={32}
              magnetPadding={120}
              magnetStrength={3}
              magnetSpringStiffness={58}
              magnetActiveDamping={13}
              magnetReturnStiffness={88}
              magnetReturnDamping={13}
              trackingBoundarySelector=".bloom-hero-copy h1"
            >
              <div className="bloom-hero-copy">
              <BlurText
                as="h1"
                text="DESIGN IN BLOOM"
                threshold={0}
                rootMargin="0px"
                scramble={{
                  radius: 120,
                  minCount: 3,
                  maxCount: 3,
                  activeLimit: 3,
                  minDuration: 0.35,
                  maxDuration: 0.55,
                  beeSrc: "/hero/design-in-bloom/bee.png",
                  flowerSrc: "/hero/design-in-bloom/flower-sprite.png",
                }}
              />
              <FadeContent className="home-reveal" delay={0.08} hero>
                <p className="hero-role">Experience Designer / AI Product / Vibe Coding</p>
              </FadeContent>
              <FadeContent className="home-reveal hero-cta-reveal" delay={0.16} hero>
                <div className="hero-cta">
                  <SpecularButton
                    size="md"
                    radius={999}
                    tint="#111111"
                    tintOpacity={1}
                    blur={7}
                    textColor="#ffffff"
                    lineColor="#ffffff"
                    baseColor="#111111"
                    intensity={0.92}
                    shineSize={8}
                    shineFade={44}
                    thickness={1}
                    speed={0.24}
                    followMouse
                    proximity={280}
                    autoAnimate
                    onClick={() => scrollToSection("work")}
                  >
                    查看作品
                  </SpecularButton>
                </div>
              </FadeContent>
              </div>
            </BeeSwarmHero>
          </div>
        </section>

        <HomeMarquee />
        </BloomPhysicsExperience>

        <section className="about-section section" id="about">
          <div className="shell">
            <FadeContent className="home-reveal" delay={0.04}>
              <EditorialAbout profile={aboutProfile} />
            </FadeContent>
          </div>
        </section>

        <section className="work-section section" id="work">
          <div className="project-gallery-shell">
            <div className="section-heading">
              <div className="section-index">SELECTED WORK / 2026</div>
              <div className="section-heading-row">
                <BlurText as="h2" text="精选作品" />
                <FadeContent className="home-reveal" delay={0.05}>
                  <p>四个方向展示用户体验、复杂系统、运营创意与 AI 产品思考。</p>
                </FadeContent>
              </div>
            </div>
            <FadeContent className="home-reveal home-reveal-block" delay={0.06}>
              <AccordionGallery
                items={projectGalleryItems}
                duration={0.6}
                expandRatio={0.52}
                height={520}
                gap={14}
                radius={24}
                tilt={6}
                trigger="hover"
              />
            </FadeContent>
          </div>
        </section>

        <DesignProcess />

        <section
          className="contact-section section"
          id="contact"
          data-brand-region="true"
          data-brand-contrast="dark"
        >
          <div className="shell contact-inner">
            <p>LET&apos;S TALK / OPEN TO WORK</p>
            <div className="contact-heading-row">
              <BlurText as="h2" text={"保持联系，\n一起把问题想清楚。"} />
              <span className="contact-mark" aria-hidden="true">↗</span>
            </div>
            <FadeContent className="home-reveal" delay={0.06}>
              <div className="contact-bottom">
                <span>XUE STUDIO · UI/UX · AI PRODUCT</span>
                <a className="button button-dark" href="#top">返回顶部 <span aria-hidden="true">↑</span></a>
              </div>
            </FadeContent>
          </div>
        </section>
      </main>
      <footer className="footer" data-brand-region="true" data-brand-contrast="dark">
        <FadeContent className="home-reveal footer-reveal" delay={0.04}>
          <div className="shell footer-inner">
            <strong>XUE STUDIO</strong>
            <span>DESIGN IN BLOOM · 2026</span>
          </div>
        </FadeContent>
      </footer>
    </>
  );
}

function CasePage({ project }) {
  return (
    <>
      <Navigation inverted />
      <main className="case-page shell">
        <a className="case-back" href="/#work">← 返回作品</a>
        <header className="case-hero">
          <div>
            <p>{project.category} / {project.index}</p>
            <h1>{project.title}</h1>
          </div>
          <p>{project.summary}</p>
        </header>

        <dl className="case-meta">
          <div><dt>我的工作</dt><dd>{project.scope}</dd></div>
          <div><dt>项目周期</dt><dd>{project.duration}</dd></div>
          <div><dt>交付内容</dt><dd>{project.deliverable}</dd></div>
        </dl>

        <MediaPlaceholder className={`case-cover project-tone-${project.tone}`} label={project.mediaLabel} />
        <p className="case-note">当前为结构示例，后续替换为真实项目素材和研究证据。</p>

        <div className="case-sections">
          {project.sections.map((section, index) => (
            <section className="case-section" key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div className="case-section-copy">
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
              <div className="case-evidence">
                <strong>内容提示</strong>
                <p>{section.prompt}</p>
              </div>
            </section>
          ))}
        </div>

      </main>
      <CaseOtherLink project={project} />
    </>
  );
}

function NotFoundPage() {
  return (
    <main className="not-found shell">
      <p>404</p>
      <h1>这个页面还没有内容。</h1>
      <a className="button button-light" href="/">返回首页</a>
    </main>
  );
}

export default function App({ initialPath, previousDocumentPath = null }) {
  const path = initialPath ?? (typeof window === "undefined" ? "/" : window.location.pathname);
  const match = path.match(/^\/work\/([^/]+)\/?$/);
  let page;

  if (match) {
    const project = getProject(match[1]);
    page = !project
      ? <NotFoundPage />
      : project.frames
        ? <FigmaCaseStudy Navigation={Navigation} project={project} />
        : <CasePage project={project} />;
  } else {
    page = path === "/" ? <HomePage previousDocumentPath={previousDocumentPath} /> : <NotFoundPage />;
  }

  return (
    <ClickSpark
      sparkColor="#ffffff"
      sparkSize={10}
      sparkRadius={18}
      sparkCount={8}
      duration={320}
      easing="ease-out"
    >
      {page}
    </ClickSpark>
  );
}
