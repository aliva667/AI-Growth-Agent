# AI Native 新人成长教练

面向腾讯游戏部门新员工与转 AI 员工的 90 天学习与融入 MVP Demo。

## 本地运行

```bash
npm run dev
```

访问 `http://localhost:4174/`。

## 构建

```bash
npm run build
```

构建产物位于 `dist/`，可直接部署到 Vercel、Netlify、GitHub Pages 或任意静态站点服务。

## Vercel 部署

1. 新建 Vercel 项目并导入本目录。
2. Build Command 使用 `npm run build`。
3. Output Directory 使用 `dist`。
4. 部署完成后复制 Vercel 提供的公网 URL。

## GitHub Pages 部署

仓库已包含 `.github/workflows/pages.yml`。在 GitHub 仓库的 Settings → Pages 中选择 GitHub Actions 后，推送 `main` 会自动部署到：

`https://aliva667.github.io/AI-Growth-Agent/`

## AI 接口预留

当前 MVP 使用 `src/app.js` 中的规则版 `aiProvider`，包含：

- `chat`
- `assess`
- `generatePlan`
- `reviewPractice`

后续接入真实大模型时，只需替换该 Provider 的实现，不需要改动页面流程。
