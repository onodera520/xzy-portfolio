import FlowingMenu from "./FlowingMenu.jsx";
import { caseFooterThemes, getCaseFooterItems } from "../data/projects.js";

export function CaseOtherLink({ project }) {
  const items = getCaseFooterItems(project.slug);
  const theme = caseFooterThemes[project.tone];

  return (
    <footer className="case-flowing-menu" data-brand-region="true" data-brand-contrast="dark">
      <FlowingMenu items={items} speed={15} {...theme} />
    </footer>
  );
}
