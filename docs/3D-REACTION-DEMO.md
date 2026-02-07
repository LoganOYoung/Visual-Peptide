# 3D 反应演示 (3D reaction demo)

## 目标

在站内用**多帧 PDB 轨迹**演示「反应过程」（如多肽与受体结合、构象变化），提升科普/科研向定位，不做前端实时计算。

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

## 后续可做（未实现）

- **中级**：关键帧插值 (Morphing)，仅提供反应前/后两结构，前端插值平滑过渡（需 RDKit.js 或专门插值库）。  
- **高级**：预渲染 4K 透明背景短视频 + 滚动驱动播放，用于首页 Hero 等强视觉场景。

## 相关文件

| 路径 | 说明 |
|------|------|
| `components/TrajectoryViewer.tsx` | 多帧轨迹播放器（3Dmol.js） |
| `lib/trajectoryDemos.ts` | 演示列表：每项为 `framePdbIds`（多 PDB ID）或 `pdbUrl`（单文件） |
| `public/trajectories/` | 可放置多 MODEL PDB 文件，如 `demo.pdb` |
| `app/structure/demo/page.tsx` | 演示页路由 |
| `app/structure/page.tsx` | 单帧 3D 页，含「3D reaction demo」入口 |

## 避坑

- **不要**在前端做实时量子/分子动力学计算。  
- **务必**使用「预设数据驱动」：轨迹或关键帧预先算好，前端只负责加载与播放。
