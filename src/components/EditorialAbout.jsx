import "./EditorialAbout.css";

function RichText({ parts }) {
  return parts.map((part, index) =>
    part.strong ? (
      <strong key={`${part.text}-${index}`}>{part.text}</strong>
    ) : (
      <span key={`${part.text}-${index}`}>{part.text}</span>
    ),
  );
}

export default function EditorialAbout({ profile }) {
  return (
    <article className="editorial-about" aria-labelledby="editorial-about-name">
      <div className="editorial-about__info">
        <header className="editorial-about__header">
          <p className="editorial-about__direction">{profile.direction}</p>
          <h2 id="editorial-about-name">{profile.name}</h2>
          <p className="editorial-about__english-name">{profile.englishName}</p>
          <p className="editorial-about__intro">{profile.intro}</p>
        </header>

        <section
          className="editorial-about__section"
          aria-labelledby="about-education-title"
        >
          <h3 id="about-education-title">教育经历</h3>
          <ul className="editorial-about__education">
            {profile.education.map((item) => (
              <li key={`${item.school}-${item.dates}`}>
                <strong>{item.school}</strong>
                <span>{item.program} · {item.level}</span>
                <time>{item.dates}</time>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="editorial-about__section"
          aria-labelledby="about-experience-title"
        >
          <h3 id="about-experience-title">实习经历</h3>
          <div className="editorial-about__job">
            <strong>{profile.experience.company}</strong>
            <span>{profile.experience.role}</span>
            <time>{profile.experience.dates}</time>
          </div>
          <ul className="editorial-about__achievements">
            {profile.experience.achievements.map((item, index) => (
              <li key={index}>
                <RichText parts={item.parts} />
              </li>
            ))}
          </ul>
        </section>

        <section
          className="editorial-about__section editorial-about__strength"
          aria-labelledby="about-strength-title"
        >
          <h3 id="about-strength-title">个人优势</h3>
          <p><RichText parts={profile.strength.parts} /></p>
        </section>

        <address className="editorial-about__contacts">
          {profile.contacts.map((item) => (
            <div key={item.label}>
              <span className="editorial-about__contact-label">{item.label}</span>
              {item.href ? (
                <a href={item.href}>{item.value}</a>
              ) : (
                <span>{item.value}</span>
              )}
            </div>
          ))}
        </address>
      </div>

      <div className="editorial-about__portrait">
        <img
          src={profile.portrait.src}
          alt={profile.portrait.alt}
          width={profile.portrait.width}
          height={profile.portrait.height}
          loading="lazy"
          decoding="async"
        />
      </div>
    </article>
  );
}
