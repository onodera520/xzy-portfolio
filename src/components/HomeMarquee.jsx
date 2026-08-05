import ScrollVelocity from "./ScrollVelocity.jsx";
import { homeMarqueeRows } from "../data/projects.js";

export function HomeMarquee() {
  return (
    <ScrollVelocity
      className="home-marquee-text"
      damping={46}
      numCopies={6}
      stiffness={280}
      texts={homeMarqueeRows}
      velocity={34}
    />
  );
}
