import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaSlot } from "../../components";
import { getProject, projects } from "../../content";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = getProject((await params).slug);
  return { title: project?.title ?? "项目案例" };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <main className="case-page page-shell">
      <Link className="back-link" href="/#work">返回项目列表</Link>
      <header className="case-hero">
        <p>{project.category}</p>
        <h1>{project.title}</h1>
        <p className="case-summary">{project.summary}</p>
      </header>

      <dl className="case-meta">
        <div><dt>我的工作</dt><dd>{project.scope}</dd></div>
        <div><dt>项目周期</dt><dd>{project.duration}</dd></div>
        <div><dt>交付内容</dt><dd>{project.deliverable}</dd></div>
      </dl>

      <MediaSlot label={project.mediaLabel} tall={project.slug === "campaign"} />
      <p className="demo-notice">示例内容，等待替换为真实项目材料。</p>

      <div className="case-sections">
        {project.sections.map((section, index) => (
          <section className="case-section" key={section.title}>
            <div className="case-section-copy">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </div>
            </div>
            <div className="evidence-slot">
              <strong>内容提示</strong>
              <p>{section.note}</p>
            </div>
          </section>
        ))}
      </div>

      <nav className="case-end" aria-label="案例末尾导航">
        <p>案例骨架结束</p>
        <Link href="/#work">查看其他项目</Link>
      </nav>
    </main>
  );
}
