import FaultyTerminal from "./FaultyTerminal.jsx";

const HERO_GRID = [2, 1];

export function HeroTerminal() {
  return (
    <div className="hero-media" aria-hidden="true">
      <FaultyTerminal
        data-faulty-terminal="true"
        scale={1.25}
        gridMul={HERO_GRID}
        digitSize={1.2}
        timeScale={0.2}
        scanlineIntensity={0.45}
        glitchAmount={0.45}
        flickerAmount={0.18}
        noiseAmp={0.12}
        chromaticAberration={0}
        dither={0}
        curvature={0.05}
        tint="#4fa1ff"
        mouseReact
        mouseStrength={0.18}
        dpr={1}
        pageLoadAnimation
        brightness={0.72}
      />
      <div className="hero-scrim" />
    </div>
  );
}
