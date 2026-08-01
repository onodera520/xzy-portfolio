import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "./components";
import { projects } from "./content";

export const metadata: Metadata = {
  title: "UI/UX 作品集 Demo",
};

export default function Home() {
  return (
    <main>
      <section className="hero page-shell">
        <p className="hero-kicker">UI/UX 设计研究生</p>
        <h1>把复杂问题，设计成清晰体验。</h1>
        <p className="hero-summary">关注用户研究、产品逻辑与可落地的体验表达。</p>
        <a className="primary-link" href="#work">查看项目</a>
      </section>

      <section className="work-section page-shell" id="work">
        <div className="section-heading">
          <h2>精选项目</h2>
          <p>三个案例分别展示用户体验、复杂系统与运营创意能力。</p>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="ai-preview page-shell">
        <div>
          <h2>AI 与设计</h2>
          <p>我把 AI 看作放大提问、探索与验证的工具，而不是替代设计判断的答案。</p>
        </div>
        <Link className="secondary-link" href="/ai">阅读我的观点</Link>
      </section>

      <section className="about-preview page-shell">
        <p>下一步</p>
        <h2>了解我的方法、能力和求职方向。</h2>
        <Link className="primary-link" href="/about">关于我</Link>
      </section>
    </main>
  );
}
