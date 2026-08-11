# Editorial About Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage 3D ProfileCard with one static editorial two-column profile that presents Ziyi Xue's education, quantified internship results, AI strengths, portrait, and public contact information.

**Architecture:** Store the profile as plain structured data in `src/data/aboutProfile.js`, render it through a focused `EditorialAbout` component, and keep its responsive visual rules in a colocated stylesheet. `App.jsx` will only compose the section and its existing entrance animation; the old ProfileCard implementation will be removed after its only call site is replaced.

**Tech Stack:** React 19, JavaScript, semantic HTML, plain CSS, Vite, Node test runner, React server-side rendering tests.

## Global Constraints

- Do not render `ABOUT / ME`, carousel controls, `PREV / NEXT`, 3D tilt, holographic effects, or continuous animation.
- Use the existing local `/about/ziyi-xue-cutout.png` portrait and preserve its declared `1024 × 1536` dimensions.
- Desktop uses a 58% information / 42% portrait split; below `768px` the portrait appears visually above the information without shrinking the entire module.
- Render phone `18668155572`, email `2830008192@qq.com`, and WeChat `onodera1006` inside the About module.
- Phone uses a `tel:` link, email uses a `mailto:` link, and WeChat remains selectable text without custom clipboard state.
- Use semantic `<strong>` elements for schools, company, capabilities, `20+ 核心页面`, `AI Coding`, `50%`, `20+ 高频组件`, `30%`, and `95%+`.
- Do not add packages, online fonts, remote images, deployment configuration, or public hosting.
- Preserve the user's existing unstaged `src/components/ScrollVelocity.css` change and never include it in feature commits.

---

## File Structure

- Create `src/data/aboutProfile.js`: the single source of truth for identity, education, internship achievements, AI strengths, and contacts.
- Create `src/components/EditorialAbout.jsx`: semantic renderer for the profile data and portrait.
- Create `src/components/EditorialAbout.css`: scoped editorial card, desktop grid, tablet adjustments, and mobile visual reordering.
- Modify `src/App.jsx`: replace the current ProfileCard block with EditorialAbout and remove the section index.
- Modify `src/styles.css`: remove homepage overrides that only support the old `about-layout`, ProfileCard column, old copy, and signature layout.
- Modify `tests/portfolio.test.mjs`: replace ProfileCard tests with profile-data, semantic content, link, and responsive-source tests.
- Delete `src/components/ProfileCard.jsx` and `src/components/ProfileCard.css`: remove the unused 3D card after confirming no remaining imports.

---

### Task 1: Profile Data and Semantic Editorial Component

**Files:**
- Create: `src/data/aboutProfile.js`
- Create: `src/components/EditorialAbout.jsx`
- Create: `src/components/EditorialAbout.css`
- Modify: `tests/portfolio.test.mjs`

**Interfaces:**
- Produces: `aboutProfile`, a plain object with `direction`, `name`, `englishName`, `intro`, `education`, `experience`, `strength`, `contacts`, and `portrait`.
- Produces: `EditorialAbout({ profile })`, a React component that renders the supplied profile and rich-text `parts` arrays.
- Consumes: local portrait path `/about/ziyi-xue-cutout.png`.

- [ ] **Step 1: Write the failing structured-data and semantic rendering tests**

Append tests that import the new data and component, then verify the complete public information and emphasized results:

```js
test("editorial About data contains the complete public profile", async () => {
  const { aboutProfile } = await import("../src/data/aboutProfile.js");

  assert.equal(aboutProfile.name, "薛梓毅");
  assert.equal(aboutProfile.englishName, "Ziyi Xue");
  assert.equal(aboutProfile.education.length, 2);
  assert.equal(aboutProfile.experience.achievements.length, 5);
  assert.deepEqual(
    aboutProfile.contacts.map((item) => item.value),
    ["18668155572", "2830008192@qq.com", "onodera1006"],
  );
});

test("EditorialAbout renders quantified achievements as semantic emphasis", async () => {
  const { aboutProfile } = await import("../src/data/aboutProfile.js");
  const { default: EditorialAbout } = await vite.ssrLoadModule(
    "/src/components/EditorialAbout.jsx",
  );
  const html = renderToStaticMarkup(
    React.createElement(EditorialAbout, { profile: aboutProfile }),
  );

  for (const value of [
    "20+ 核心页面",
    "AI Coding",
    "50%",
    "20+ 高频组件",
    "30%",
    "95%+",
  ]) {
    assert.match(html, new RegExp(`<strong>${value.replace("+", "\\+")}</strong>`));
  }
  assert.match(html, /href="tel:18668155572"/);
  assert.match(html, /href="mailto:2830008192@qq\.com"/);
  assert.match(html, /<span[^>]*>onodera1006<\/span>/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /width="1024"/);
  assert.match(html, /height="1536"/);
});
```

- [ ] **Step 2: Run the tests and verify the new imports fail**

Run: `npm.cmd test`

Expected: FAIL because `src/data/aboutProfile.js` and `src/components/EditorialAbout.jsx` do not exist.

- [ ] **Step 3: Create the complete profile data**

Create `src/data/aboutProfile.js` with plain text plus rich-text parts. Each part is `{ text: string, strong?: boolean }`; this keeps emphasis explicit and prevents HTML strings:

```js
export const aboutProfile = {
  direction: "UI / UX / AI 体验设计",
  name: "薛梓毅",
  englishName: "Ziyi Xue",
  intro:
    "武汉理工大学工业设计与交互设计硕士在读，关注复杂业务系统与 AI 产品体验。擅长从业务流程和用户角色出发，将复杂需求转化为清晰、可执行并能高质量落地的设计方案。",
  portrait: {
    src: "/about/ziyi-xue-cutout.png",
    alt: "薛梓毅个人肖像",
    width: 1024,
    height: 1536,
  },
  education: [
    { school: "武汉理工大学", program: "工业设计与交互设计", level: "硕士", dates: "2025.09—至今" },
    { school: "浙江科技大学", program: "工业设计", level: "本科", dates: "2021.09—2025.06" },
  ],
  experience: {
    company: "浙江数智交院科技股份有限公司",
    role: "UI 设计实习生",
    dates: "2026.06—2026.10",
    achievements: [
      { parts: [{ text: "梳理隐患上报、整改复核和审批流转等核心业务，优化冗余步骤，提升岗位协作与办公效率。" }] },
      { parts: [{ text: "根据用户权限差异，独立完成 " }, { text: "20+ 核心页面", strong: true }, { text: "，覆盖甘特图、资源台账、安全巡检及数据报表等 B 端模块。" }] },
      { parts: [{ text: "使用 " }, { text: "AI Coding", strong: true }, { text: " 将设计快速转化为可交互 Demo，辅助前端还原，开发效率提升 " }, { text: "50%", strong: true }, { text: "。" }] },
      { parts: [{ text: "沉淀 " }, { text: "20+ 高频组件", strong: true }, { text: "及设计规范，统一多项目设计语言，团队设计效率提升 " }, { text: "30%", strong: true }, { text: "。" }] },
      { parts: [{ text: "联动产品、前端和实施团队推进交付，核心页面还原度达到 " }, { text: "95%+", strong: true }, { text: "，保障项目按期验收。" }] },
    ],
  },
  strength: {
    parts: [
      { text: "我是 ChatGPT、Gemini 及 " },
      { text: "AI Coding", strong: true },
      { text: " 工具的深度使用者，持续研究 AI 产品体验设计。注重 " },
      { text: "Token 成本与产出质量", strong: true },
      { text: "，已经形成从调研、构思、原型到验证的个人 AI 工作流。" },
    ],
  },
  contacts: [
    { label: "电话", value: "18668155572", href: "tel:18668155572" },
    { label: "邮箱", value: "2830008192@qq.com", href: "mailto:2830008192@qq.com" },
    { label: "微信", value: "onodera1006" },
  ],
};
```

- [ ] **Step 4: Create the semantic component and initial scoped stylesheet**

Create `src/components/EditorialAbout.jsx`. Use a local helper that maps every rich-text part to either `<strong>` or `<span>`, then render one `article` with an information column and portrait column:

```jsx
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
        <section className="editorial-about__section" aria-labelledby="about-education-title">
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
        <section className="editorial-about__section" aria-labelledby="about-experience-title">
          <h3 id="about-experience-title">实习经历</h3>
          <div className="editorial-about__job">
            <strong>{profile.experience.company}</strong>
            <span>{profile.experience.role}</span>
            <time>{profile.experience.dates}</time>
          </div>
          <ul className="editorial-about__achievements">
            {profile.experience.achievements.map((item, index) => (
              <li key={index}><RichText parts={item.parts} /></li>
            ))}
          </ul>
        </section>
        <section className="editorial-about__section editorial-about__strength" aria-labelledby="about-strength-title">
          <h3 id="about-strength-title">个人优势</h3>
          <p><RichText parts={profile.strength.parts} /></p>
        </section>
        <address className="editorial-about__contacts">
          {profile.contacts.map((item) => (
            <div key={item.label}>
              <span className="editorial-about__contact-label">{item.label}</span>
              {item.href ? <a href={item.href}>{item.value}</a> : <span>{item.value}</span>}
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
```

Create `src/components/EditorialAbout.css` with scoped class names, a light background, `32px` radius, a `minmax(0, 58fr) minmax(320px, 42fr)` grid, readable typography, list separators, and strong weights. Include the exact mobile grid-area rules shown in Task 2 so the responsive-source test can verify them.

- [ ] **Step 5: Run the full test suite**

Run: `npm.cmd test`

Expected: the new data and component tests PASS; existing homepage tests still pass because App integration has not changed yet.

- [ ] **Step 6: Commit the self-contained data and component**

```powershell
git add -- src/data/aboutProfile.js src/components/EditorialAbout.jsx src/components/EditorialAbout.css tests/portfolio.test.mjs
git commit -m "feat: add editorial profile component"
```

Do not stage `src/components/ScrollVelocity.css`.

---

### Task 2: Homepage Integration and Responsive Editorial Layout

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Modify: `src/components/EditorialAbout.css`
- Modify: `tests/portfolio.test.mjs`
- Delete: `src/components/ProfileCard.jsx`
- Delete: `src/components/ProfileCard.css`

**Interfaces:**
- Consumes: `aboutProfile` from `src/data/aboutProfile.js`.
- Consumes: `EditorialAbout({ profile })` from `src/components/EditorialAbout.jsx`.
- Produces: the final homepage About section at `#about`.

- [ ] **Step 1: Replace the old homepage assertions with failing editorial-layout assertions**

Update the homepage story test so it verifies the new copy, emphasis, public contacts, and removal of the old section label and ProfileCard:

```js
assert.match(html, /薛梓毅/);
assert.match(html, /Ziyi Xue/);
assert.match(html, /UI \/ UX \/ AI 体验设计/);
assert.match(html, /浙江数智交院科技股份有限公司/);
assert.match(html, /href="tel:18668155572"/);
assert.match(html, /href="mailto:2830008192@qq\.com"/);
assert.match(html, /onodera1006/);
assert.doesNotMatch(html, /ABOUT \/ ME/);
assert.doesNotMatch(html, /pc-card-wrapper|data-tilt-enabled/);
```

Replace the old ProfileCard source behavior test with a stylesheet regression test:

```js
test("editorial About keeps its desktop split and mobile portrait-first layout", () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), "src", "components", "EditorialAbout.css"),
    "utf8",
  );

  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*58fr\)\s+minmax\(320px,\s*42fr\)/);
  assert.match(css, /border-radius:\s*32px/);
  assert.match(css, /filter:\s*grayscale\(1\)/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)[\s\S]*grid-template-areas:\s*"portrait"\s*"info"/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
});
```

- [ ] **Step 2: Run tests and verify the homepage test fails**

Run: `npm.cmd test`

Expected: FAIL because `App.jsx` still renders `ABOUT / ME` and ProfileCard.

- [ ] **Step 3: Replace the About composition in App.jsx**

Remove:

```jsx
import ProfileCard from "./components/ProfileCard.jsx";
```

Add:

```jsx
import EditorialAbout from "./components/EditorialAbout.jsx";
import { aboutProfile } from "./data/aboutProfile.js";
```

Replace the contents of the existing `#about` section with:

```jsx
<section className="about-section section" id="about">
  <div className="shell">
    <FadeContent className="home-reveal" duration={1.05} delay={0.04}>
      <EditorialAbout profile={aboutProfile} />
    </FadeContent>
  </div>
</section>
```

Do not change neighboring homepage sections.

- [ ] **Step 4: Complete the desktop, tablet, and mobile styling**

In `src/components/EditorialAbout.css`, implement:

```css
.editorial-about {
  display: grid;
  grid-template-columns: minmax(0, 58fr) minmax(320px, 42fr);
  grid-template-areas: "info portrait";
  overflow: hidden;
  border-radius: 32px;
  background: #f2f2f0;
  color: #111;
}

.editorial-about__info { grid-area: info; }
.editorial-about__portrait { grid-area: portrait; }
.editorial-about__portrait img { filter: grayscale(1); }
.editorial-about__contacts a,
.editorial-about__contacts span { overflow-wrap: anywhere; }

@media (max-width: 767px) {
  .editorial-about {
    grid-template-columns: 1fr;
    grid-template-areas:
      "portrait"
      "info";
    border-radius: 24px;
  }
}
```

Add the detailed spacing and typography needed by the spec: information padding `clamp(28px, 4.5vw, 76px)`, portrait minimum height, name `clamp(52px, 6vw, 104px)`, section separators, 1.7 body line height, three-column contacts, and one-column contacts below `767px`. Add a `768px–1024px` media query that reduces gap and font size without switching the desktop order.

In `src/styles.css`, delete only the now-unused homepage rules for `.home-page .about-layout`, `.about-card-reveal`, `.about-card-column`, `.home-page .about-copy`, and `.about-signature`. Leave shared generic About rules alone if another route still depends on them.

- [ ] **Step 5: Confirm ProfileCard has no remaining call sites, then delete it**

Run:

```powershell
rg -n "ProfileCard|pc-card-wrapper" src tests
```

Expected before deletion: matches only in `src/components/ProfileCard.jsx`, `src/components/ProfileCard.css`, and negative regression assertions. Delete the two component files with `apply_patch`, then rerun the search and confirm production code has no match.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
npm.cmd test
npm.cmd run build
```

Expected: all tests PASS and the Vite production build exits `0`. A pre-existing chunk-size advisory may remain, but there must be no compilation error.

- [ ] **Step 7: Commit the integration without the unrelated user change**

```powershell
git add -- src/App.jsx src/styles.css src/components/EditorialAbout.css tests/portfolio.test.mjs src/components/ProfileCard.jsx src/components/ProfileCard.css
git commit -m "feat: redesign homepage about section"
```

Confirm `src/components/ScrollVelocity.css` remains unstaged.

---

### Task 3: Final Regression and Handoff

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/data/aboutProfile.js`
- Verify: `src/components/EditorialAbout.jsx`
- Verify: `src/components/EditorialAbout.css`
- Verify: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: the completed homepage `#about` implementation.
- Produces: fresh verification evidence and a local-only handoff.

- [ ] **Step 1: Run the complete automated regression suite**

Run: `npm.cmd test`

Expected: zero failures, zero cancelled tests, and zero skipped tests.

- [ ] **Step 2: Run the production build**

Run: `npm.cmd run build`

Expected: Vite exits `0` and emits `dist/index.html` plus CSS and JavaScript assets.

- [ ] **Step 3: Check changed-file hygiene**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors. `src/components/ScrollVelocity.css` remains the user's independent unstaged change and is not part of any About commit.

- [ ] **Step 4: Report the local result**

Report the new editorial About structure, the highlighted quantitative results, public contacts, mobile portrait-first layout, exact test count, and build result. Do not deploy or publish the site.
