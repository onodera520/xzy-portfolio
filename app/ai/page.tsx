import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI 与设计实践" };

const practices = [
  ["提问", "用 AI 帮助展开问题空间，但由研究证据决定问题是否成立。"],
  ["探索", "快速比较多个方向，把时间留给取舍、验证与细节完善。"],
  ["验证", "把生成结果当作假设，通过用户反馈、业务约束和设计原则继续检查。"],
];

export default function AIPage() {
  return (
    <main className="essay-page page-shell">
      <header className="essay-hero">
        <p>个人观点</p>
        <h1>AI 与设计实践</h1>
        <p>AI 不是替代判断的答案，而是放大提问、探索与验证的工具。</p>
      </header>

      <section className="position-section">
        <h2>我的立场</h2>
        <p>设计的价值不只来自产出速度，也来自如何定义问题、理解人和承担决策结果。AI 可以提高探索效率，但不能自动提供真实语境。</p>
      </section>

      <section className="practice-section">
        <h2>我如何使用</h2>
        <div className="practice-list">
          {practices.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="boundary-section">
        <h2>我的边界</h2>
        <div>
          <p>不把生成内容伪装成真实研究结果。</p>
          <p>不上传未经授权的用户隐私与商业信息。</p>
          <p>重要决策保留来源、推理过程与人工复核。</p>
        </div>
      </section>
    </main>
  );
}
