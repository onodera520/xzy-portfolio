# Demo XZY 公开发布与轻量本地交付

## 目标

将当前通过验证的作品集 Demo 发布为任何招聘者都能直接打开的公开网址。线上网站不依赖用户电脑运行，本地目录只保留源码、内容、配置、测试和依赖清单。

## 发布方式

- 保留当前 vinext 源码与六个页面，不进行视觉或内容改动。
- 使用 Sites 创建公开部署，并在部署成功后打开线上网址验证。
- 发布前重新运行完整构建与路由测试，发布内容必须与验证内容一致。

## 本地清理

- 线上成功后停止本地开发服务。
- 删除可重新生成的 `node_modules`、`.npm-cache`、`dist`、`.vinext` 和 `.wrangler`。
- 保留 `package.json` 与 `package-lock.json`，未来可通过 `npm install` 恢复开发环境。
- 不删除 `app`、`public`、`tests`、`docs`、`.openai` 或其他源码配置。

