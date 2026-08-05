# Demo XZY

一个面向 UI/UX 求职展示的 React + Vite 作品集基础版本。当前包含首页、三个案例页、设计决策互动实验和移动端适配，视频与项目图片暂用轻量占位。

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

## Useful Commands

- `npm run dev`：在 `http://localhost:3000` 启动本地开发服务
- `npm test`：验证页面结构、案例数据和互动策略
- `npm run build`：生成轻量生产包

## Add the hero video later

复制 `.env.example` 为 `.env.local`，把桌面视频放入 `public/media/`，再填写 `VITE_HERO_VIDEO_URL=/media/your-video.mp4`。手机端、减少动态效果模式和省流量模式会自动使用静态占位，不加载视频。
