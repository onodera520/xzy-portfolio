import BorderGlow from "./BorderGlow.jsx";

export function ProjectCard({ project }) {
  const glow = project.slug === "consumer"
    ? { glowColor: "202 96 70", colors: ["#3aa9ff", "#7ee8ff", "#e9fbff"] }
    : project.slug === "enterprise"
      ? { glowColor: "222 94 72", colors: ["#446dff", "#74a7ff", "#b8c8ff"] }
      : { glowColor: "18 92 70", colors: ["#ff8c68", "#ffcc78", "#ff7da8"] };

  return (
    <BorderGlow
      className={`project-card project-tone-${project.tone}`}
      backgroundColor="#151716"
      borderRadius={24}
      {...glow}
    >
      <a href={`/work/${project.slug}`} aria-label={`查看${project.title}`}>
        {project.cover ? (
          <div className="project-media has-cover">
            <picture>
              {project.cover.mobile && <source media="(max-width: 767px)" srcSet={project.cover.mobile} />}
              <img
                src={project.cover.src}
                alt={project.cover.alt}
                loading="lazy"
                decoding="async"
                width="1920"
                height="1080"
              />
            </picture>
          </div>
        ) : (
          <div className="project-media project-cover-placeholder" aria-label={`${project.title}媒体占位`} role="img">
            <span>H5 / COMING SOON</span>
            <strong>03</strong>
          </div>
        )}
        <div className="project-card-copy">
          <p>{project.category}</p>
          <h3>{project.title}</h3>
          <span className="arrow-link">进入案例 <b aria-hidden="true">↗</b></span>
        </div>
      </a>
    </BorderGlow>
  );
}
