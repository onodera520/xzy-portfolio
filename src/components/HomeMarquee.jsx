import { useEffect, useRef } from "react";
import ScrollVelocity from "./ScrollVelocity.jsx";
import { homeMarqueeRows } from "../data/projects.js";
import { useBloomPhysics } from "./BloomPhysicsExperience.jsx";

export function HomeMarquee() {
  const floorRef = useRef(null);
  const { registerFloor } = useBloomPhysics();

  useEffect(() => {
    registerFloor(floorRef.current);
    return () => registerFloor(null);
  }, [registerFloor]);

  return (
    <div ref={floorRef} className="home-marquee" data-flower-floor="true">
      <ScrollVelocity
        className="home-marquee-text"
        numCopies={6}
        texts={homeMarqueeRows}
        velocity={34}
      />
    </div>
  );
}
