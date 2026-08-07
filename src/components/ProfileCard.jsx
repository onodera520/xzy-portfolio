import React, { useEffect, useRef } from "react";

import "./ProfileCard.css";

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

function ProfileCardComponent({
  avatarUrl,
  name,
  title,
  enableTilt = true,
  className = "",
}) {
  const wrapperRef = useRef(null);
  const shellRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const shell = shellRef.current;
    if (!wrapper || !shell || !enableTilt) return undefined;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return undefined;

    let frameId = 0;
    let enterTimer = 0;
    let currentX = shell.clientWidth - 70;
    let currentY = 60;
    let targetX = shell.clientWidth / 2;
    let targetY = shell.clientHeight / 2;

    const applyPointer = (x, y) => {
      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;
      const pointerX = clamp((x / width) * 100);
      const pointerY = clamp((y / height) * 100);
      const centerX = pointerX - 50;
      const centerY = pointerY - 50;

      wrapper.style.setProperty("--pointer-x", `${pointerX}%`);
      wrapper.style.setProperty("--pointer-y", `${pointerY}%`);
      wrapper.style.setProperty("--background-x", `${35 + pointerX * 0.3}%`);
      wrapper.style.setProperty("--background-y", `${35 + pointerY * 0.3}%`);
      wrapper.style.setProperty("--pointer-distance", `${clamp(Math.hypot(centerX, centerY) / 50, 0, 1)}`);
      wrapper.style.setProperty("--rotate-x", `${-(centerX / 6)}deg`);
      wrapper.style.setProperty("--rotate-y", `${centerY / 5}deg`);
      wrapper.style.setProperty("--parallax-x", `${centerX * -0.08}px`);
      wrapper.style.setProperty("--parallax-y", `${centerY * -0.06}px`);
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      applyPointer(currentX, currentY);

      if (Math.abs(targetX - currentX) > 0.08 || Math.abs(targetY - currentY) > 0.08) {
        frameId = requestAnimationFrame(animate);
      } else {
        frameId = 0;
      }
    };

    const moveTo = (x, y) => {
      targetX = x;
      targetY = y;
      if (!frameId) frameId = requestAnimationFrame(animate);
    };

    const handlePointerMove = (event) => {
      const rect = shell.getBoundingClientRect();
      moveTo(event.clientX - rect.left, event.clientY - rect.top);
    };

    const handlePointerEnter = (event) => {
      shell.classList.add("is-active", "is-entering");
      window.clearTimeout(enterTimer);
      enterTimer = window.setTimeout(() => shell.classList.remove("is-entering"), 180);
      handlePointerMove(event);
    };

    const handlePointerLeave = () => {
      shell.classList.remove("is-active");
      moveTo(shell.clientWidth / 2, shell.clientHeight / 2);
    };

    shell.addEventListener("pointerenter", handlePointerEnter);
    shell.addEventListener("pointermove", handlePointerMove);
    shell.addEventListener("pointerleave", handlePointerLeave);
    shell.addEventListener("pointercancel", handlePointerLeave);

    applyPointer(currentX, currentY);
    shell.classList.add("is-entering");
    moveTo(targetX, targetY);
    enterTimer = window.setTimeout(() => shell.classList.remove("is-entering"), 1200);

    return () => {
      shell.removeEventListener("pointerenter", handlePointerEnter);
      shell.removeEventListener("pointermove", handlePointerMove);
      shell.removeEventListener("pointerleave", handlePointerLeave);
      shell.removeEventListener("pointercancel", handlePointerLeave);
      window.clearTimeout(enterTimer);
      if (frameId) cancelAnimationFrame(frameId);
      shell.classList.remove("is-active", "is-entering");
    };
  }, [enableTilt]);

  return (
    <div
      ref={wrapperRef}
      className={`pc-card-wrapper ${className}`.trim()}
      data-tilt-enabled={enableTilt ? "true" : "false"}
    >
      <div className="pc-behind" aria-hidden="true" />
      <div ref={shellRef} className="pc-card-shell">
        <section className="pc-card" aria-label={`${name} 个人介绍卡片`}>
          <div className="pc-inside">
            <div className="pc-shine" aria-hidden="true" />
            <div className="pc-glare" aria-hidden="true" />
            <div className="pc-pattern" aria-hidden="true" />
            <img
              className="pc-avatar"
              src={avatarUrl}
              alt={`${name} 个人照片`}
              loading="lazy"
              decoding="async"
              width="1024"
              height="1536"
            />
            <div className="pc-details">
              <h3>{name}</h3>
              <p>{title}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const ProfileCard = React.memo(ProfileCardComponent);

export default ProfileCard;
