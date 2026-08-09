import { AITerminal } from "./components/AITerminal.jsx";
import { HomeMarquee } from "./components/HomeMarquee.jsx";
import { InteractionLab } from "./components/InteractionLab.jsx";
import AccordionGallery from "./components/AccordionGallery.jsx";
import { FigmaCaseStudy } from "./components/FigmaCaseStudy.jsx";
import { CaseOtherLink } from "./components/CaseOtherLink.jsx";
import BlurText from "./components/BlurText.jsx";
import FadeContent from "./components/FadeContent.jsx";
import SoftAurora from "./components/SoftAurora.jsx";
import SpecularButton from "./components/SpecularButton.jsx";
import BorderGlow from "./components/BorderGlow.jsx";
import PillNav from "./components/PillNav.jsx";
import ProfileCard from "./components/ProfileCard.jsx";
import { HomeLiquidBackground } from "./components/HomeLiquidBackground.jsx";
import { getProject, projectGalleryItems } from "./data/projects.js";

export function scrollToSection(
  sectionId,
  documentRoot = typeof document === "undefined" ? null : document,
) {
  const section = documentRoot?.getElementById(sectionId);
  if (!section) return false;

  section.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

function Navigation({ homeLinks = false, inverted = false }) {
  const anchor = homeLinks ? "#" : "/#";
  const items = [
    { label: "作品", href: `${anchor}work` },
    { label: "关于", href: `${anchor}about` },
    { label: "互动实验", href: `${anchor}lab` },
    { label: "联系", href: `${anchor}contact` },
  ];

  return (
    <header className={`site-nav${inverted ? " site-nav-solid" : ""}`}>
      <BorderGlow
        as="div"
        className="site-nav-glow"
        edgeSensitivity={28}
        glowColor="210 90 74"
        backgroundColor="#050505"
        borderRadius={22}
        glowRadius={28}
        glowIntensity={0.78}
        coneSpread={24}
        fillOpacity={0.2}
        animated
        continuous
        colors={["#8db9ef", "#c084fc", "#75e6da"]}
      >
        <div className="nav-inner shell">
          <a className="wordmark" href="/" aria-label="XZY 作品集首页">XZY</a>
          <PillNav
            items={items}
            activeHref={homeLinks ? undefined : `${anchor}work`}
            frameless
          />
        </div>
      </BorderGlow>
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

function HomePage() {
  return (
    <>
      <HomeLiquidBackground />
      <Navigation homeLinks />
      <main className="home-page">
        <section className="hero" id="top">
          <div className="hero-stage shell">
            <div className="hero-aurora" aria-hidden="true">
              <SoftAurora
                speed={0.13}
                scale={1.55}
                brightness={0.86}
                color1="#83adff"
                color2="#f5cc82"
                noiseFrequency={1.72}
                noiseAmplitude={0.58}
                bandHeight={0.64}
                bandSpread={0.92}
                octaveDecay={0.14}
                layerOffset={0.18}
                colorSpeed={0.24}
                enableMouseInteraction={false}
              />
            </div>
            <span className="hero-orbit hero-orbit-one" aria-hidden="true">✦</span>
            <span className="hero-orbit hero-orbit-two" aria-hidden="true">✳</span>
            <div className="hero-content shell">
              <FadeContent className="home-reveal" duration={1.1} delay={0.1}>
                <p className="hero-role">UI/UX DESIGNER · RESEARCHER</p>
              </FadeContent>
              <BlurText
                as="h1"
                text={"把复杂问题，\n设计成清晰体验。"}
                delay={48}
                stepDuration={0.58}
                threshold={0}
                rootMargin="0px"
              />
              <FadeContent className="home-reveal hero-cta-reveal" duration={1.1} delay={0.26}>
                <div className="hero-cta">
                  <SpecularButton
                    size="lg"
                    radius={18}
                    tint="#ffffff"
                    tintOpacity={0.08}
                    blur={10}
                    textColor="#ffffff"
                    lineColor="#ffffff"
                    baseColor="#525252"
                    intensity={1.2}
                    shineSize={10}
                    shineFade={40}
                    thickness={1}
                    speed={0.28}
                    followMouse
                    proximity={280}
                    autoAnimate
                    onClick={() => scrollToSection("work")}
                  >
                    查看作品
                  </SpecularButton>
                </div>
              </FadeContent>
              <FadeContent className="home-reveal" duration={1.1} delay={0.32}>
                <div className="hero-bottom">
                  <p>关注用户研究、产品逻辑与可落地的体验表达。</p>
                </div>
              </FadeContent>
            </div>
          </div>
        </section>

        <HomeMarquee />

        <section className="about-section section" id="about">
          <div className="shell">
            <div className="section-index">ABOUT / ME</div>
            <div className="about-layout">
              <FadeContent className="home-reveal about-card-reveal" duration={1.05} delay={0.04}>
                <div className="about-card-column">
                  <ProfileCard
                    avatarUrl="/about/ziyi-xue-cutout.png"
                    name="Ziyi Xue"
                    title="求职方向：UI/UX/AI体验设计"
                  />
                </div>
              </FadeContent>
              <FadeContent className="home-reveal" duration={1.05} delay={0.12}>
                <div className="about-copy">
                  <p>我从研究和业务语境出发，把复杂流程整理成清晰、可理解、可执行的体验。</p>
                  <dl>
                    <div><dt>关注方向</dt><dd>产品设计、UX 设计</dd></div>
                    <div><dt>工作方式</dt><dd>研究、定义、原型、验证</dd></div>
                    <div><dt>当前状态</dt><dd>开放求职机会</dd></div>
                  </dl>
                </div>
              </FadeContent>
            </div>
            <div className="about-signature" aria-hidden="true">
              <span>RESEARCH</span><b>×</b><span>DESIGN</span><b>×</b><span>DELIVERY</span>
            </div>
          </div>
        </section>

        <section className="work-section section" id="work">
          <div className="project-gallery-shell">
            <div className="section-heading">
              <div className="section-index">SELECTED WORK / 2026</div>
              <div className="section-heading-row">
                <BlurText as="h2" text="精选作品" delay={72} />
                <FadeContent className="home-reveal" duration={1} delay={0.08}>
                  <p>四个方向展示用户体验、复杂系统、运营创意与 AI 产品思考。</p>
                </FadeContent>
              </div>
            </div>
            <AccordionGallery
              items={projectGalleryItems}
              expandRatio={0.52}
              height={520}
              gap={14}
              radius={24}
              tilt={6}
              trigger="hover"
            />
          </div>
        </section>

        <section className="lab-section section" id="lab">
          <div className="lab-stage shell">
            <div className="lab-heading">
              <div className="section-index">INTERACTION / DECISION LAB</div>
              <div className="lab-heading-row">
                <BlurText as="h2" text="设计决策实验室" delay={58} />
                <FadeContent className="home-reveal" duration={1} delay={0.08}>
                  <p>好的设计不是选择最好看的方案，而是在不同价值与约束之间做出清楚判断。</p>
                </FadeContent>
              </div>
            </div>
            <InteractionLab />
          </div>
        </section>

        <section className="ai-section section">
          <div className="shell">
            <div className="section-index">AI × DESIGN</div>
            <div className="ai-heading-row">
              <BlurText as="h2" text="AI 与设计" delay={66} />
              <p>不是替代判断，而是扩展问题空间。</p>
            </div>
            <div className="ai-layout">
              <div className="ai-terminal-card">
                <AITerminal />
                <span>QUESTION / EXPLORE / VERIFY</span>
              </div>
              <FadeContent className="home-reveal" duration={1.05} delay={0.1}>
                <div className="ai-copy">
                  <p>我把 AI 看作放大提问、探索与验证的工具，而不是替代设计判断的答案。</p>
                  <ul>
                    <li><span>01</span>用 AI 展开问题空间，再由研究证据判断问题是否成立。</li>
                    <li><span>02</span>用快速探索换取更多比较时间，而不是跳过取舍。</li>
                    <li><span>03</span>不把生成内容伪装成真实用户研究结果。</li>
                  </ul>
                </div>
              </FadeContent>
            </div>
          </div>
        </section>

        <section className="contact-section section" id="contact">
          <div className="shell contact-inner">
            <p>LET&apos;S TALK / OPEN TO WORK</p>
            <div className="contact-heading-row">
              <BlurText as="h2" text={"保持联系，\n一起把问题想清楚。"} delay={48} />
              <span className="contact-mark" aria-hidden="true">↗</span>
            </div>
            <FadeContent className="home-reveal" duration={1} delay={0.1}>
              <div className="contact-bottom">
                <span>邮箱与简历链接将在下一版补充</span>
                <a className="button button-dark" href="#top">返回顶部 <span aria-hidden="true">↑</span></a>
              </div>
            </FadeContent>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="shell footer-inner">
          <strong>XZY</strong>
          <span>UI/UX PORTFOLIO · 2026</span>
        </div>
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
      <CaseOtherLink />
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

export default function App({ initialPath }) {
  const path = initialPath ?? (typeof window === "undefined" ? "/" : window.location.pathname);
  const match = path.match(/^\/work\/([^/]+)\/?$/);

  if (match) {
    const project = getProject(match[1]);
    if (!project) return <NotFoundPage />;
    return project.frames
      ? <FigmaCaseStudy Navigation={Navigation} project={project} />
      : <CasePage project={project} />;
  }

  return path === "/" ? <HomePage /> : <NotFoundPage />;
}
