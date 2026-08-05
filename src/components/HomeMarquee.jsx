import ScrollVelocity from "./ScrollVelocity.jsx";
import { homeMarqueeRows } from "../data/projects.js";

export function HomeMarquee() {
  return (
    <ScrollVelocity
      className="home-marquee-text"
      numCopies={6}
      texts={homeMarqueeRows}
      velocity={34}
    />
  );
}
