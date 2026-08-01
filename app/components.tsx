import Link from "next/link";
import type { Project } from "./content";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label="XZY 作品集首页">
          XZY
        </Link>
        <nav className="site-nav" aria-label="主导航">
          <Link href="/#work">项目</Link>
          <Link href="/ai">AI 与设计</Link>
          <Link href="/about">关于</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>XZY</strong>
        <p>UI/UX 设计研究生作品集框架</p>
      </div>
      <Link href="/about">联系与简历</Link>
    </footer>
  );
}

export function MediaSlot({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div className={`media-slot${tall ? " media-slot-tall" : ""}`} role="img" aria-label={label}>
      <span>{label}</span>
      <small>等待替换为真实项目图片</small>
    </div>
  );
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className={`project-card project-card-${index + 1}`}>
      <Link href={`/work/${project.slug}`} aria-label={`查看${project.title}`}>
        <MediaSlot label={project.mediaLabel} tall={project.slug === "campaign"} />
        <div className="project-copy">
          <p className="project-category">{project.category}</p>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <span className="text-link">查看案例</span>
        </div>
      </Link>
    </article>
  );
}
