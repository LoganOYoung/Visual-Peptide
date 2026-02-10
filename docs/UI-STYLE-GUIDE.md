# 全站 UI 风格设计说明

本站面向**研究用肽**场景：计算器、目录、验证、供应商信息。UI 以**清晰、可信、克制**为主，避免花哨或娱乐化。

---

## 一、设计原则

| 原则 | 说明 |
|------|------|
| **清晰优先** | 信息层级清楚，关键操作一眼可见；计算与数据可读性高于装饰。 |
| **可信感** | 深色背景 + 少量高对比强调色，整体偏「工具/实验室」气质，不网红风。 |
| **克制** | 少用动效与渐变；留白和间距统一，不堆砌元素。 |
| **无障碍** | 对比度达标、焦点可见、语义化标题与地标，支持键盘与读屏。 |

---

## 二、色彩

### 主色

- **背景**：深灰蓝（slate-950 `#020617`）为主背景，降低长时间看的刺眼感。
- **卡片/表面**：slate-800（`#1e293b`）通过 CSS 变量 `--card`，与背景有层次又不抢眼。
- **边框**：slate-700 级（`--border`），细线分隔，不喧宾夺主。

### 强调色

- **主强调**：Teal（`#14b8a6`，Tailwind teal-500）用于主按钮、关键链接、当前态。
- **悬停/深色**：Teal 略深（`--accent-dim`）用于 hover，保持同一色相。

### 文字

- **正文**：浅灰白（slate-100 / `--text`），保证在深底上的可读性。
- **次要**：slate-400 用于描述、说明、副标题。
- **弱化**：slate-500 用于免责、时间戳、提示小字。

### 使用约定

- 主操作一个页面尽量只用一个「主按钮色」；其余用 outline/ghost。
- 危险操作（若有）可用 red-500/600，本站目前无删除等强危险操作。
- 不随意增加新强调色；保持 teal 为唯一强调色系。

---

## 三、字体与排版

- **无衬线**：Geist Sans（`geist/font/sans`），全站界面与正文，保证各平台一致与品牌感。
- **等宽**：Geist Mono（`geist/font/mono`），数字、代码、CAS/PDB ID、序列等用 `font-mono`，便于扫读。
- **层级**：
  - 页面主标题：`text-3xl font-bold`，白色。
  - 区块标题：`text-lg–2xl font-semibold`。
  - 正文：默认或 `text-sm`；说明类可 `text-slate-400`。
  - 小字/免责：`text-xs text-slate-500`。

---

## 四、间距与布局

- **页面外边距**：`max-w-6xl mx-auto px-4`，保证宽屏不拉满、小屏有留白。
- **区块间距**：section 之间 `py-12` 或 `py-14`，保持呼吸感一致。
- **卡片内边距**：`p-6`（`.card`），内部表单项或段落用 `mt-4` / `gap-4` 等 4 的倍数。
- **栅格**：工具卡片等用 `grid gap-5` 或 `gap-6`，避免过密。

---

## 五、组件规范

### 卡片（.card）

- 圆角 `rounded-xl`，边框 `border border-[var(--border)]`，背景 `--card`。
- 可加 `shadow-lg`；悬停可 `hover:border-teal-500/50`，不强制阴影变化。
- 用于：工具入口、表单区块、说明区块、供应商 CTA。

### 主按钮（.btn-primary）

- 背景 teal，文字深色（slate-900）保证对比度。
- `rounded-lg`，`px-4 py-2.5`，带 focus 环（focus:ring-2 + ring-offset）。
- 仅用于单页内 1–2 个主操作（如「Open Calculator」「View Suppliers」）。

### 次要按钮 / 链接按钮

- 边框 + 深灰底（`border border-slate-600 bg-slate-800`），文字白色，hover 时 `border-teal-500/50` 或 `hover:bg-slate-700`。
- 与主按钮区分明显，不抢主操作。

### 输入框（.input）

- 与卡片风格统一：深底、细边框、focus 时 teal 边框/ring。
- placeholder 使用 `text-slate-500`。

### 链接

- 正文内链接：`text-teal-400 hover:underline`，必要时 `underline-offset-2`。
- 导航当前项：teal 背景/描边（如 `bg-teal-500/20 text-teal-400`）。

---

## 六、文案与语气

- **中性、专业**：避免夸张或娱乐化用词。
- **简短**：标题和 CTA 一句话说清；说明控制在 1–2 句，详情交给子页。
- **免责可见**：涉及剂量、供应商、验证时，在页脚或区块内保留「Research only / Not medical advice / Verify yourself」类提示。

---

## 七、避免

- 大面积渐变、闪动动效、自动轮播。
- 多种强调色混用（保持 teal 唯一）。
- 过小可点击区域（按钮/链接足够大，便于触屏）。
- 纯装饰性图标或插图；若用图标，与功能一致（如计算器、验证）。

---

## 八、与代码的对应

- 色彩与卡片：`app/globals.css` 中 `:root` 与 `.card` / `.btn-primary` / `.input`。
- 扩展色/字体：`tailwind.config.ts` 中 `theme.extend`（如 brand、surface）。
- 新组件应复用现有 class，或在本文档中补充约定后再实现。

以上即为全站 UI 风格的设计约定；迭代时优先保持一致性，再考虑局部增强。
