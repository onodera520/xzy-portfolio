import FaultyTerminal from "./FaultyTerminal.jsx";

const AI_GRID = [2, 1];

export function AITerminal() {
  return (
    <div className="ai-terminal-visual" aria-hidden="true">
      <FaultyTerminal
        data-faulty-terminal="true"
        brightness={0.7}
        chromaticAberration={0}
        curvature={0.04}
        digitSize={1.35}
        dither={0}
        dpr={1}
        flickerAmount={0.16}
        glitchAmount={0.38}
        gridMul={AI_GRID}
        mouseReact
        mouseStrength={0.14}
        noiseAmp={0.1}
        pageLoadAnimation
        scale={1.2}
        scanlineIntensity={0.38}
        timeScale={0.18}
        tint="#79a8ff"
      />
      <div className="ai-terminal-scrim" />
    </div>
  );
}
