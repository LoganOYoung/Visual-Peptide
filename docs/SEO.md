# 全站 SEO 说明

## 已做优化

### 1. 元数据与规范链接
- **根 layout**：`metadataBase`、默认 title/description、keywords、openGraph、twitter、robots、viewport、themeColor。
- **所有可收录页**：独立 `title`、`description`，以及 **canonical URL** 和 **openGraph.url**。
- **覆盖页面**：首页、/tools、/peptides、/peptides/[slug]、/peptides/compare、/structure、/structure/demo、/verify、/suppliers、/guide、/faq、/about，以及各工具子页（calculator、syringe-planner、vial-cycle、unit-converter、cost）。
- **not-found**：title、description，`robots: noindex, follow`。
- **test-page**：title、description，`robots: noindex, nofollow`（不收录、不跟踪）。

### 2. 结构化数据 (JSON-LD) — 已全部落地
| 类型 | 位置 | 说明 |
|------|------|------|
| **WebSite** | 根 layout | 站点名、URL、描述、publisher → Organization |
| **Organization** | 根 layout | 名称、URL、描述、logo |
| **FAQPage** | /faq | 所有 FAQ 的 Question/Answer，利于 FAQ 富结果与语音搜索 |
| **BreadcrumbList** | 所有带面包屑的页 | 传入 `baseUrl` 时由 Breadcrumbs 组件自动输出 |
| **ItemList** | /tools | 工具列表：Recon & Dosing、Syringe Planner、Vial & Cycle、Unit Converter、Cost per Dose（含 name、url、description） |
| **ItemList** | /peptides | 肽库列表：所有肽的 name、url（链到 /peptides/[slug]） |

### 3. 技术细节
- **lib/site.ts**：`getBaseUrl()`、`getCanonicalUrl(path)`，生产环境用 `VERCEL_URL` 或 `SITE_URL`，默认 `https://www.visualpeptide.com`。
- **robots**：`app/robots.ts` 允许全站抓取（不含 /test-page/），sitemap 指向 `/sitemap.xml`。
- **sitemap**：`app/sitemap.ts` 包含首页、/tools、各工具子页、/peptides、/peptides/compare、各肽详情、/structure、/structure/demo、/verify、/guide、/suppliers、/faq、/about。
- **Breadcrumbs**：组件支持可选 `baseUrl`，传入后输出 BreadcrumbList JSON-LD；所有使用面包屑的页面均已传入 `baseUrl`。

### 4. 可选后续
- 在 Google Search Console 提交 sitemap 和域名。
- 若使用 Google 站长验证，设置环境变量 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` 并在 layout 的 `metadata.verification.google` 中使用。
- 重要页面若有图片，为图片补充 `alt` 与合适尺寸，便于图片搜索。
