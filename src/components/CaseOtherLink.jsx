import ScrollFloat from "./ScrollFloat.jsx";

export function CaseOtherLink() {
  return (
    <footer className="case-other-link">
      <a href="/#work" aria-label="返回首页查看其他案例">
        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="top bottom"
          scrollEnd="bottom bottom"
          stagger={0.03}
        >
          查看其他案例
        </ScrollFloat>
      </a>
    </footer>
  );
}
