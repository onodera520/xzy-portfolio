import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "./components";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "XZY | UI/UX 作品集 Demo",
    template: "%s | XZY",
  },
  description: "一名 UI/UX 设计研究生的中文作品集框架 Demo。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
