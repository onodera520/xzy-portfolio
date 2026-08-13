import { useEffect, useRef } from "react";

import "./ContactModal.css";

const QQ_MAIL_URL = "https://wx.mail.qq.com/?cancel_login=true&from=get_ticket_fail";

export default function ContactModal({ open, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;

    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="contact-modal" onMouseDown={handleBackdropClick}>
      <section
        className="contact-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <button
          ref={closeButtonRef}
          className="contact-modal__close"
          type="button"
          aria-label="关闭联系弹窗"
          onClick={onClose}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <img
          className="contact-modal__decoration contact-modal__decoration--bouquet"
          src="/hero/design-in-bloom/flower.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="contact-modal__decoration contact-modal__decoration--flower-small"
          src="/hero/design-in-bloom/flower-sprite.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="contact-modal__decoration contact-modal__decoration--flower-large"
          src="/hero/design-in-bloom/flower-sprite.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="contact-modal__decoration contact-modal__decoration--bee-top"
          src="/hero/design-in-bloom/bee.png"
          alt=""
          aria-hidden="true"
        />
        <img
          className="contact-modal__decoration contact-modal__decoration--bee-bottom"
          src="/hero/design-in-bloom/bee.png"
          alt=""
          aria-hidden="true"
        />

        <div className="contact-modal__qr-column">
          <div className="contact-modal__qr-frame">
            <img src="/contact/wechat-qr.png" alt="微信二维码" width="662" height="662" />
          </div>
          <p><i aria-hidden="true" />微信联系</p>
        </div>

        <div className="contact-modal__copy">
          <h2 id="contact-modal-title">保持联系</h2>
          <p>欢迎聊聊设计、研究与新的可能</p>
          <a href={QQ_MAIL_URL} target="_blank" rel="noreferrer">
            通过邮箱联系
            <img
              className="contact-modal__qq-logo"
              src="/contact/qq-logo.png"
              alt=""
              aria-hidden="true"
              width="280"
              height="280"
            />
          </a>
        </div>
      </section>
    </div>
  );
}
