# 功能实现全面核查与方案评估

本文档对当前所有主要功能的实现方式做逐项核查，并判断是否为最佳方案；必要时给出改进建议。

---

## 1. 架构与约束

| 项目 | 当前实现 | 是否最佳 | 说明 |
|------|----------|----------|------|
| 技术栈 | Next.js 14 (App Router) + Tailwind + TypeScript | ✅ | 与目标一致，无后端、无 API 路由。 |
| 数据与计算 | 纯前端：静态数据 (lib/*) + 纯函数 (lib/calc.ts) | ✅ | 无服务端依赖，可复现构建。 |
| 站点 URL | lib/site.ts：getBaseUrl() / getCanonicalUrl()，依赖 SITE_URL/VERCEL_URL | ✅ | 服务端/构建时用 process.env；客户端用 fallback，合理。 |

---

## 2. 核心功能模块

### 2.1 计算器 (Recon & Dosing, Vial, Unit, Cost, Syringe)

| 项目 | 当前实现 | 是否最佳 | 说明 |
|------|----------|----------|------|
| 计算逻辑 | lib/calc.ts 纯函数，无副作用 | ✅ | 易测、可复用，符合纯前端约束。 |
| 状态与派生 | CalculatorContent：useState + useMemo 派生浓度/体积/单位 | ✅ | 无冗余计算，依赖清晰。 |
| 初始值 | useSearchParams 读 ?peptide= → getPeptideBySlug → typicalDoseMcg | ✅ | 与肽库联动合理。 |
| 注射器选项 | SYRINGE_MAX_UNITS 与 SYRINGE_OPTIONS 一致 | ✅ | 可考虑抽到 lib/calc 或常量文件统一，非必须。 |

**结论**：计算器相关实现已是最佳方案，无需调整。

---

### 2.2 肽库与肽详情

| 项目 | 当前实现 | 是否最佳 | 说明 |
|------|----------|----------|------|
| 数据源 | lib/peptides.ts 静态数组 + getPeptideBySlug / getAllSlugs 等 | ✅ | 构建时确定，无运行时请求；满足当前规模。 |
| 列表页 | /peptides：PeptideLibrary 客户端筛选 + QuickSearch | ✅ | 数据在内存，交互简单清晰。 |
| 详情页 | /peptides/[slug]：generateStaticParams + getPeptideBySlug，SSG | ✅ | 静态生成，SEO 与性能均佳。 |
| 详情页 3D | 有 pdbId 时渲染 PdbViewerInSite（非 dynamic） | ⚠️ | 与 /structure 一致用 PdbViewerInSite 即可；若希望首屏更轻可对 PdbViewerInSite 做 next/dynamic(ssr:false)，非必须。 |

**结论**：肽库与详情整体已是最佳方案；3D 可按需做按需加载优化。

---

### 2.3 3D 结构 (单结构 + 轨迹 Demo)

| 项目 | 当前实现 | 是否最佳 | 说明 |
|------|----------|----------|------|
| 单结构查看器 (PdbViewerInSite) | npm 包 3dmol + 动态 import("3dmol")，同源 chunk | ✅ | 已从 CDN 改为 npm，从根本上避免脚本加载失败，为当前最佳。 |
| /structure 页 | force-dynamic、getResolvedParams、ViewerSectionErrorBoundary、nextDynamic 包一层 PdbViewerInSite | ✅ | 动态路由与错误隔离得当。 |
| 轨迹/多帧 (TrajectoryViewer) | 仍通过 CDN 注入 3Dmol（3Dmol.org + jsDelivr 回退） | ❌ | 与单结构方案不一致，存在与 PdbViewerInSite 相同的 CDN 风险。 |
| PdbViewer.tsx (iframe 嵌 RCSB) | 未被任何页面或组件引用 | ❌ | 死代码，建议删除或明确保留为“仅 iframe 备用”并加注释。 |

**已实施**：

- **TrajectoryViewer**：已改为在组件内 `await import("3dmol")` 获取库引用并传入 run()，去掉 CDN 与 window.$3Dmol 依赖，与 PdbViewerInSite 一致。
- **PdbViewer.tsx**：已删除（未被引用，属死代码）。

---

### 2.4 验证与供应商

| 项目 | 当前实现 | 是否最佳 | 说明 |
|------|----------|----------|------|
| ReportVerifier | 本地 state 存 taskId，拼 Janoshik URL，仅外链 | ✅ | 无后端、无存储，符合约束。 |
| PurityPulse | 静态/客户端展示，数据来自 lib/purityPulse | ✅ | 合理。 |
| Suppliers | lib/suppliers.ts 静态表 | ✅ | 与肽库模式一致。 |

**结论**：验证与供应商相关实现已是最佳方案。

---

### 2.5 元数据与 RCSB 请求

| 项目 | 当前实现 | 是否最佳 | 说明 |
|------|----------|----------|------|
| PdbStructureMetadata | 客户端 fetch RCSB data.rcsb.org，cache: "force-cache" | ✅ | 纯前端、可缓存；若同一 PDB 在多处展示可考虑 SWR/React Query 去重，非必须。 |
| 结构页 PDB 文件 | 客户端 fetch files.rcsb.org/view/{id}.pdb | ✅ | 同源策略允许，无需后端代理。 |

**结论**：当前方案已足够好；如需可再做请求去重与缓存策略。

---

## 3. 路由、SEO、错误处理

| 项目 | 当前实现 | 是否最佳 | 说明 |
|------|----------|----------|------|
| 动态/静态 | structure: force-dynamic；peptides/[slug]: generateStaticParams | ✅ | 与是否依赖 searchParams/params 一致。 |
| searchParams (Next 14/15) | getResolvedParams(searchParams) 兼容 Promise 与对象 | ✅ | 避免同步访问 Promise，最佳。 |
| generateMetadata | 各页 try/catch + 安全默认值 | ✅ | 避免 metadata 抛错导致白屏。 |
| Sitemap / robots | app/sitemap.ts、robots.ts 使用 getBaseUrl() | ✅ | 符合纯静态/无后端。 |
| 错误边界 | app/error、app/structure/error、app/structure/demo/error 使用共享 ErrorFallback | ✅ | 无重复 UI，易维护。 |
| 查看器局部错误 | ViewerSectionErrorBoundary 包住 Metadata + PdbViewerInSite，fallback 内联 | ✅ | 避免整页崩溃，体验好。 |

**结论**：路由、SEO 与错误处理均为最佳或接近最佳方案。

---

## 4. UI 与样式

| 项目 | 当前实现 | 是否最佳 | 说明 |
|------|----------|----------|------|
| 样式方案 | Tailwind + globals.css 变量 (--bg, --accent 等) + @layer components | ✅ | 主题与组件样式分离清晰。 |
| Tailwind theme | fontFamily 使用 var(--font-geist-sans) 等 | ⚠️ | layout 未注入对应 CSS 变量，实际回退到 system-ui；若未使用 Geist 字体可考虑删掉 theme 中的 fontFamily 或补全字体加载。 |
| 导航 | lib/nav.ts 集中配置，Header 客户端下拉 | ✅ | 结构清晰，易于增删链接。 |
| Breadcrumbs | 服务端组件，接收 baseUrl；部分页面在客户端调 getBaseUrl() 传入 | ✅ | 客户端环境下 getBaseUrl() 为 fallback 域名，可接受。 |

**结论**：整体已是最佳或可接受；仅字体变量为小优化点。

---

## 5. 配置与构建

| 项目 | 当前实现 | 是否最佳 | 说明 |
|------|----------|----------|------|
| next.config | 仅 dev 下 watchOptions | ✅ | 3dmol 未进 transpilePackages 也能正常构建，可保持现状。 |
| 依赖 | next、react、3dmol 等，无多余后端库 | ✅ | 符合纯前端。 |

---

## 6. 总结表：是否最佳方案

| 功能/模块 | 是否最佳 | 建议 |
|-----------|----------|------|
| 计算器 (calc + UI) | ✅ | 保持 |
| 肽库与详情 | ✅ | 可选：详情页 3D 用 dynamic 按需加载 |
| 单结构 3D (PdbViewerInSite) | ✅ | 已改为 npm，保持 |
| 轨迹 3D (TrajectoryViewer) | ✅ | 已改为 npm 3dmol + dynamic import |
| PdbViewer.tsx | ✅ | 已删除（死代码） |
| 验证/供应商/报告 | ✅ | 保持 |
| 元数据/RCSB 请求 | ✅ | 保持，可选做请求去重 |
| 路由/SEO/错误边界 | ✅ | 保持 |
| UI/样式/导航 | ✅ | 可选：统一字体变量或移除未用配置 |

**优先建议**（从根本性改进角度）：

1. **TrajectoryViewer**：改为使用 npm `3dmol` + 动态 import，与 PdbViewerInSite 一致，从根本上去掉 CDN 依赖。
2. **PdbViewer.tsx**：删除或标注为备用，避免死代码与认知负担。

其余功能当前实现方式均可视为最佳或已足够好，仅剩小优化（字体、按需加载、缓存）可按需实施。
