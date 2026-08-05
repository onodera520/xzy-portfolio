import { useMemo, useState } from "react";
import { calculateDecision } from "../lib/decision.js";

const inputs = [
  { key: "user", label: "用户价值" },
  { key: "business", label: "业务价值" },
  { key: "effort", label: "实现成本" },
];

export function InteractionLab() {
  const [values, setValues] = useState({ user: 76, business: 72, effort: 42 });
  const result = useMemo(() => calculateDecision(values), [values]);

  const update = (key, value) => {
    setValues((current) => ({ ...current, [key]: Number(value) }));
  };

  return (
    <div className="lab-console">
      <div className="lab-controls">
        <p className="lab-instruction">调整三个变量，观察设计策略如何变化。</p>
        {inputs.map((input) => (
          <label className="range-field" key={input.key}>
            <span>
              {input.label}
              <output htmlFor={`range-${input.key}`}>{values[input.key]}</output>
            </span>
            <input
              id={`range-${input.key}`}
              max="100"
              min="0"
              onInput={(event) => update(input.key, event.currentTarget.value)}
              type="range"
              value={values[input.key]}
            />
          </label>
        ))}
      </div>

      <div className={`lab-result lab-result-${result.key}`} aria-live="polite">
        <p>当前建议</p>
        <h3>{result.title}</h3>
        <p>{result.summary}</p>
        <div>
          <span>下一步</span>
          <strong>{result.action}</strong>
        </div>
      </div>
    </div>
  );
}
