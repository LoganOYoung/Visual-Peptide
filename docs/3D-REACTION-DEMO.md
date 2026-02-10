# 3D 反应演示 (3D reaction demo)

## 功能定位

- **是什么**：用**多帧 3D 分子结构**按时间顺序播放，呈现「反应过程」或「构象变化」的页面（如多肽靠近并嵌入受体、pH 下折叠/展开等）。与单结构页「看一张静态 3D」不同，这里强调**过程**。
- **给谁用**：主要对应 Persona 9「结构/化学背景用户」——想看 3D、PDB、以及**结合/变化过程**的科研、教学、B 端客户。顺带服务科普向访客（用预设 demo 快速建立信任）。
- **价值**：把站点从「工具站」提升为「生化科普/科研向平台」；教育营销、SEO 停留时长、与竞品的差异化（多数站只有静态图）。

## 目标（产品/技术）

在站内用**多帧 PDB 轨迹**演示反应过程，提升科普/科研向定位；**不做**前端实时计算，坚持「预设数据驱动」。

## 所需功能（清单）

| 功能 | 状态 | 说明 |
|------|------|------|
| 多帧轨迹播放 | ✅ 已有 | 按帧顺序播放，循环；3Dmol.js 渲染 |
| 播放 / 暂停 | ✅ 已有 | 控制动画启停 |
| 帧数显示与帧按钮 | ✅ 已有 | 显示「第 n / 总帧数」；≤20 帧时显示帧按钮可点选 |
| 自定义输入：PDB ID 列表 | ✅ 已有 | 输入多个 PDB ID（逗号/空格分隔），从 RCSB 拉取并播放 |
| 自定义输入：多 MODEL 文件 URL | ✅ 已有 | 输入站内路径或完整 URL，加载单文件多 MODEL PDB |
| 预设 demo | ✅ 已有 | 若干预设轨迹（如 Semaglutide & GLP-1R、small peptides、multi-MODEL 文件） |
| 单结构页入口 | ✅ 已有 | 从 3D Structure 页可跳转到本页 |
| 播放速度调节 | ✅ 已有 | 0.5× / 1× / 1.5× / 2×，切换后立即生效 |
| 全屏模式 | ✅ 已有 | 工具栏「Fullscreen」，便于讲解、录屏 |
| 导出截图 | ✅ 已有 | 工具栏「Screenshot」，下载当前视角 PNG |
| 导出透明 PNG | ✅ 已有 | 工具栏「PNG (transparent)」，尝试透明背景导出（依赖 3Dmol 支持） |
| 当前帧 PDB 下载 | ✅ 已有 | 工具栏「Current frame PDB」，下载当前帧的 PDB 文件 |
| 导出 GIF | ✅ 已有 | 工具栏「Export GIF」，将前 20 帧导出为 GIF 动画 |
| 可拖拽时间轴 | ✅ 已有 | 多帧时显示进度条，拖拽即跳帧（并暂停），类似视频进度条 |
| 状态联动 URL | ✅ 已有 | URL 带 `frame` / `play` / `speed` / `view`，分享即所见（同帧同视角） |
| Verify with Batch Report | ✅ 已有 | Lab 侧栏与 Custom 视窗下方入口，链到 /verify |
| 分享链接 | ✅ 已有 | 自定义加载后「Copy share link」；URL 带 `?pdbIds=...` 或 `?pdbUrl=...` 可直开 |
| 关键帧插值 (Morphing) | ✅ 已有 | 选「Morph (A→B)」，输入两个 PDB ID，前端线性插值生成多帧并播放 |
| 预渲染视频 (Hero) | ✅ 已有 | 首页「3D reaction demo」区块：可放 `public/videos/reaction-hero.mp4`，无则显示 CTA 链到 /structure/demo |

**明星产品反应演示**（约束式、商业向）：  
- 下拉选肽（仅列出有预设演示的明星产品）→ 受体自动带出 →「Run simulation」→ 进入 **Laboratory Simulation Mode**（深色面板 + 预设轨迹播放 + 侧栏 Binding / 结构说明）。  
- 数据在 `lib/starReactionDemos.ts`，可扩展 3–5 个核心产品。不做开放搜索，仅查表播放预设结果。

**核心必备**：多帧播放、播放/暂停、自定义输入（PDB IDs + 文件 URL）、预设 demo、明星反应演示、从 3D Structure 可进入。以上为已实现增强项。

---

## 用户能力说明（用 viewer 能做什么）

用户打开 **3D reaction demo** 页（`/structure/demo`）后，可以完成以下操作。

### 1. 观看轨迹

- **选来源**：Preset（明星肽–受体）、By PDB IDs、By file URL、Morph (A→B)。
- **加载**：点「Run simulation」或「Load trajectory」后，在页面内看到多帧 3D 结构。
- **播放**：Play / Pause、调节速度（0.5×～2×）、查看「Frame x / N」。

### 2. 像视频一样拖进度（Docking 回放）

- **时间轴**：多帧时有一条可拖拽进度条，拖到某一帧即跳转并暂停。
- **帧按钮**：≤20 帧时底部有 1、2、3… 按钮，点数字即可跳帧。
- 适合：停在某一帧细看「多肽进受体」的中间态，或前后对比。

### 3. 分享「当前状态」的链接（状态联动 URL）

- **自动写入 URL**：当前帧、是否播放、速度、**相机视角**会写入地址栏（`?frame=...&play=...&speed=...&view=...`）。
- **分享即所见**：复制链接给他人或自己新开标签，打开后为**同一帧、同一视角**。
- 适合：写报告、做 PPT、与同事对齐「你看的就是这一帧、这个角度」。

### 4. 导出与数据

- **Screenshot**：当前画面 PNG（带背景）。
- **PNG (transparent)**：当前画面 PNG，尽量透明背景。
- **Current frame PDB**：下载**当前帧**的 PDB，便于在 PyMOL / Chimera 等中继续使用。
- **Export GIF**：将前 20 帧导出为 GIF 动画，便于放入 PPT 或文档。

### 5. 与验证/其它工具衔接

- **Verify with Batch Report**：在 Preset Lab 侧栏和 Custom 视窗下方均有入口，跳转至 `/verify`，可结合批次报告验证纯度等。

### 小结（用户能做什么）

| 用户目标       | 在 viewer 里能做的 |
|----------------|--------------------|
| 看结合过程     | 选 Preset 或自己的 PDB/URL/Morph，播放多帧轨迹。 |
| 停在某一帧细看 | 拖时间条或点帧号，旋转/缩放后导出 PNG 或透明 PNG。 |
| 把某一帧拿去用 | 下载「Current frame PDB」或截屏。 |
| 做动画/汇报    | 导出 GIF 或截图，复制状态链接放进 PPT/报告。 |
| 分享精确视角   | 旋转好视角后复制链接，他人打开即同帧同视角。 |
| 与纯度/批次挂钩 | 通过「Verify with Batch Report」跳转验证页。 |

---

## 实现方案（当前）

- **初级方案：多帧 PDB 轨迹 (Multi-Frame PDB)** ✅ 已实现  
  - 原理：多帧结构快照（每帧一个 PDB 或一个 multi-MODEL PDB），由 3Dmol.js 按序播放。  
  - 位置：`/structure/demo`，组件 `TrajectoryViewer`，数据配置 `lib/trajectoryDemos.ts`。  
  - 数据：预设多帧 PDB ID 列表，从 RCSB 拉取；可替换为真实 MD 轨迹或自托管 PDB 文件。

## 技术要点

- **渲染**：与单帧 3D 页共用 3Dmol.js（CDN），`addModelsAsFrames` + `animate` 实现循环播放。  
- **数据**：纯预设、数据驱动；不在前端做任何实时模拟或量子/分子动力学计算。  
- **交互**：Play/Pause、帧数显示、可选帧按钮（≤20 帧时显示），便于讲解与 SEO 停留时长。

## 数据来源与扩展

- **方式一：多个 PDB ID**（`framePdbIds`）：每帧从 RCSB 拉取一个 PDB，前端拼成多 MODEL 后播放。  
- **方式二：单个多 MODEL PDB 文件**（`pdbUrl`）：  
  - 支持 **public 路径**（如 `/trajectories/demo.pdb`）或 **任意 URL**。  
  - 文件内容需为标准多 MODEL 格式（`MODEL 1` … `ENDMDL` `MODEL 2` … `ENDMDL`）。  
  - 示例：`public/trajectories/demo.pdb`；可将自己的 MD 轨迹或 NMR 多模型 PDB 放到 `public/trajectories/`，在 `lib/trajectoryDemos.ts` 里增加 `pdbUrl: "/trajectories/xxx.pdb"`。

## 后续可做（可选）

- **Morphing 增强**：当前为同原子数、同顺序的线性插值；可扩展为残基/原子匹配或引入 RDKit.js 等做更平滑的构象插值。  
- **Hero 视频**：已将 `public/videos/reaction-hero.mp4` 作为可选预渲染视频；可再做滚动驱动播放（scroll-sync video）以增强首页冲击力。

## 相关文件

| 路径 | 说明 |
|------|------|
| `components/TrajectoryViewer.tsx` | 多帧轨迹播放器（3Dmol.js） |
| `lib/trajectoryDemos.ts` | 演示列表：每项为 `framePdbIds`（多 PDB ID）或 `pdbUrl`（单文件） |
| `public/trajectories/` | 可放置多 MODEL PDB 文件，如 `demo.pdb` |
| `app/structure/demo/page.tsx` | 演示页路由 |
| `app/structure/page.tsx` | 单帧 3D 页，含「3D reaction demo」入口 |
| `components/TrajectoryDemoIntegrated.tsx` | 集成加载器：Preset / PDB IDs / URL / Morph，状态 URL（frame/view）与 Verify 入口 |
| `components/TrajectoryDemoCustomLoader.tsx` | 自定义加载：PDB IDs / URL / Morph，分享链接与 URL 同步 |
| `components/HeroReactionVideo.tsx` | 首页 3D 反应区块：可选视频 + CTA |
| `lib/morphPdb.ts` | 两 PDB 线性插值生成多帧（Morph A→B） |
| `lib/starReactionDemos.ts` | 明星产品反应演示数据：肽 + 受体 → 预设轨迹 + binding 文案 |
| `components/StarReactionDemo.tsx` | 约束式双输入（肽下拉 + 受体自动带出）+ Laboratory Simulation Mode + 侧栏 Binding |

## 避坑

- **不要**在前端做实时量子/分子动力学计算。  
- **务必**使用「预设数据驱动」：轨迹或关键帧预先算好，前端只负责加载与播放。
