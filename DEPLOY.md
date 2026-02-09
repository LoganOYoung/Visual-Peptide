# 部署说明 (Deploy Guide)

本站为 **纯前端、无后端**，使用 **GitHub + Vercel** 部署，技术栈 **Next.js + Tailwind**。

## 前置条件

- 代码已推送到 GitHub 仓库
- 拥有 Vercel 账号（可用 GitHub 登录）

## Vercel 部署步骤

1. 打开 [vercel.com](https://vercel.com) 并登录。
2. 点击 **Add New… → Project**。
3. 选择 **Import Git Repository**，连接 GitHub 后选择本仓库（如 `visual-peptide`）。
4. **Configure Project** 保持默认即可：
   - **Framework Preset**: Next.js（自动识别）
   - **Build Command**: `npm run build`
   - **Output Directory**: 留空（Next.js 默认）
   - **Install Command**: `npm install`
5. 点击 **Deploy**，等待构建完成。
6. 部署成功后获得 `https://xxx.vercel.app` 域名；可在 Project Settings 中绑定自定义域名。

## 本地构建验证

```bash
npm install
npm run build
```

无报错即表示可在 Vercel 上正常构建。本站无 API 路由、无服务端运行时依赖，Vercel 会以 Next.js 静态/增量静态方式托管。

## 环境变量（可选）

在 Vercel → Project → Settings → Environment Variables 中可配置：

| 变量 | 说明 |
|------|------|
| `SITE_URL` | 正式站域名，如 `https://www.visualpeptide.com`。用于 sitemap、canonical、Open Graph 的 base URL。 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 的 Measurement ID（如 `G-QZMMP7M9Q2`）。配置后全站加载 gtag，用于访问统计。 |

不配置也可正常部署；不设 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 则不加载 GA。

## 技术说明

- **无后端**：未使用 `app/api/`、未连接数据库、未在服务端请求第三方 API；计算器与肽数据均在客户端或构建时完成。
- **可选环境变量**：见上表；若不配置，sitemap 使用 VERCEL_URL，且无 GA 统计。
