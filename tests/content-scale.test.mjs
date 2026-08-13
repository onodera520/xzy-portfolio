import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("desktop content scales from About downward without touching navigation or Hero", () => {
  const css = read("src/styles.css");

  assert.match(css, /--portfolio-content-max:\s*1530px/);
  assert.match(css, /--portfolio-content-width:\s*min\(calc\(90%\s*-\s*clamp\(43\.2px,\s*6\.3vw,\s*118\.8px\)\),\s*var\(--portfolio-content-max\)\)/);
  assert.match(css, /@media\s*\(min-width:\s*768px\)\s*\{[\s\S]*\.home-page \.about-section > \.shell[\s\S]*width:\s*var\(--portfolio-content-width\)/);
  assert.match(css, /\.home-page \.project-gallery-shell[\s\S]*width:\s*var\(--portfolio-content-width\)/);
  assert.match(css, /\.home-page \.process-board__shell[\s\S]*width:\s*var\(--portfolio-content-width\)/);
  assert.match(css, /\.home-page \.contact-section \.contact-inner[\s\S]*width:\s*var\(--portfolio-content-width\)/);
  assert.match(css, /\.footer \.footer-inner[\s\S]*width:\s*var\(--portfolio-content-width\)/);
  assert.match(css, /\.home-page \.work-section \.section-heading h2\s*\{[^}]*font-size:\s*clamp\(56px,\s*6\.3vw,\s*113px\)/s);
  assert.match(css, /\.home-page \.work-section \.accordion-gallery\s*\{[^}]*padding:\s*9px/s);
  assert.match(css, /\.home-page \.contact-section \.contact-inner h2\s*\{[^}]*font-size:\s*clamp\(52px,\s*7\.65vw,\s*135px\)/s);
  assert.match(css, /\.home-page \.contact-section \.contact-inner\s*\{[^}]*padding:\s*clamp\(50px,\s*4\.5vw,\s*76px\)/s);
  assert.match(css, /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1024px\)\s*\{[\s\S]*\.editorial-about__portrait\s*\{[^}]*min-height:\s*clamp\(558px,\s*70\.2vw,\s*684px\)/s);

  const desktopScaleBlock = css.match(/\/\* Portfolio content scale: desktop and tablet only \*\/[\s\S]*?\/\* End portfolio content scale \*\//)?.[0] ?? "";
  assert.doesNotMatch(desktopScaleBlock, /\.site-nav|\.hero-stage|\.home-marquee/);
});

test("portfolio cases share the narrower desktop shell while mobile widths stay unchanged", () => {
  const css = read("src/styles.css");

  assert.match(css, /@media\s*\(min-width:\s*768px\)\s*\{[\s\S]*\.board-shell[\s\S]*width:\s*var\(--portfolio-content-width\)/);
  assert.match(css, /\.case-page\.shell[\s\S]*width:\s*var\(--portfolio-content-width\)/);
  assert.match(css, /\.case-flowing-menu[\s\S]*width:\s*var\(--portfolio-content-width\)/);
  assert.match(css, /@media\s*\(max-width:\s*767px\)\s*\{[\s\S]*\.board-shell\s*\{[^}]*width:\s*calc\(100%\s*-\s*24px\)/);
});

test("work gallery uses a 468px desktop target and retains its 520px mobile target", () => {
  const app = read("src/App.jsx");
  const gallery = read("src/components/AccordionGallery.jsx");

  assert.match(app, /<AccordionGallery[\s\S]*height=\{468\}[\s\S]*mobileHeight=\{520\}/);
  assert.match(gallery, /mobileHeight\s*=\s*height/);
  assert.match(gallery, /innerWidth\s*<=\s*767\s*\?\s*mobileHeight\s*:\s*height/);
});
