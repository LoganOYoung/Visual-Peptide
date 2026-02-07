# Visual Peptide

Research-grade peptide tools: reconstitution calculator, dosing calculator, peptide directory, 3D structure viewer links, and purity verification (Janoshik).

## 技术约束 (Tech Constraints)

- **纯前端、无后端**：无 API 路由、无自建服务器、无数据库；所有逻辑与数据在构建时或浏览器内完成。
- **部署方式**：GitHub + Vercel。
- **技术栈**：Next.js + Tailwind CSS + TypeScript。

## Stack

- **Next.js 14** (App Router) — 仅用于静态生成与客户端渲染
- **Tailwind CSS** — 样式
- **TypeScript**
- 无 `app/api/`、无 Server Actions 调用后端、无环境变量连接 DB

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 避免「整站转圈、打不开」

开发时若出现页面一直转圈、整站打不开，多半是 **端口被占** 或 **多个 dev 进程** 导致：

1. **只开一个 dev**：关掉其他正在跑本项目的终端，只保留一个 `npm run dev`。
2. **先清端口再开 dev**（推荐）：
   ```bash
   npm run dev:clean
   ```
   会先结束占用 3000 的进程，再启动 dev，减少冲突。
3. **用预览看效果**：不依赖热更新时，用构建后的版本更稳：
   ```bash
   npm run preview
   ```
   然后打开 http://localhost:3000。改完代码再执行一次即可看到最新效果。

## Deploy (GitHub + Vercel)

1. 将本仓库推送到 GitHub。
2. 在 [Vercel](https://vercel.com) 中 **Import** 该 GitHub 仓库。
3. 保持默认：**Build Command** `npm run build`，**Output** 使用 Next.js 自动检测。
4. 部署后获得 `*.vercel.app` 域名。

详见 [DEPLOY.md](./DEPLOY.md)。

## Site structure

| Route | Description |
|-------|-------------|
| `/` | Home — hero, tool cards, featured peptides (7) |
| `/tools` | Tools index (calculator, vial-cycle, unit-converter, cost) |
| `/tools/calculator` | Reconstitution & dosing calculator (0.3/0.5/1 mL syringe) |
| `/tools/vial-cycle` | Vial & cycle — days per vial, vials for target period |
| `/tools/unit-converter` | mcg ↔ mg unit converter |
| `/tools/cost` | Cost per dose calculator |
| `/peptides` | Peptide directory |
| `/peptides/[slug]` | Peptide detail (BPC-157, Semaglutide, etc.) |
| `/peptides/compare` | Compare up to 3 peptides side by side |
| `/structure` | 3D structure — PDB ID → RCSB Mol* viewer |
| `/verify` | Purity & verification (Janoshik, report verifier, public DB) |
| `/guide` | Reconstitution & dosing guide + stability helper + FAQ link |
| `/suppliers` | Suppliers — verification first + static directory table |
| `/faq` | FAQ — reconstitution, storage, verification, tools |
| `/about` | About, disclaimer, privacy |

## License

Private / use as needed.
