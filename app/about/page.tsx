import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "关于 XZY" };

export default function AboutPage() {
  return (
    <main className="about-page page-shell">
      <header className="about-hero">
        <div>
          <p>关于</p>
          <h1>关于 XZY</h1>
          <p className="about-lead">我是一名正在寻找产品设计与用户体验岗位的 UI/UX 设计研究生。</p>
        </div>
        <div className="portrait-slot" role="img" aria-label="个人照片占位">
          个人照片占位
        </div>
      </header>

      <section className="about-columns">
        <div>
          <h2>我关注什么</h2>
          <p>从用户研究和业务语境出发，把复杂流程整理成清晰、可理解、可执行的体验。</p>
        </div>
        <div>
          <h2>能力范围</h2>
          <p>用户研究、信息架构、交互设计、界面设计、原型验证与跨团队协作。</p>
        </div>
        <div>
          <h2>求职方向</h2>
          <p>产品设计师、UX 设计师或同时重视研究与落地的设计岗位。</p>
        </div>
      </section>

      <section className="contact-block">
        <h2>联系我</h2>
        <p>邮箱地址待替换</p>
        <Link href="/#work">先查看项目</Link>
      </section>
    </main>
  );
}
