# 移动端优化说明

## 结论：布局、可点击性、交互性均已覆盖

- **布局**：viewport、安全区域、响应式断点、横向滚动与提示、移动端导航。
- **可点击性**：主要按钮/链接/输入/下拉均满足 ≥44px 触摸目标（含 Header 移动端子项、PeptideLibrary 筛选与 Compare、TrajectoryViewer/3D 演示的 Play/Fullscreen/Screenshot/Exit 等）。
- **交互性**：触摸无 300ms 延迟、统一点击反馈、移动端汉堡菜单与子链接、表单与工具页可用。

---

## 已做优化

### 1. Viewport 与 meta
- **viewport**（`app/layout.tsx`）：`width=device-width`、`initialScale=1`、`maximumScale=5`（允许用户缩放，利于无障碍）、`viewportFit=cover`（刘海屏/安全区域）、`themeColor`。
- **html**（`globals.css`）：`-webkit-text-size-adjust: 100%`（避免 iOS 自动放大文字）、`scroll-behavior: smooth`。

### 2. 安全区域（刘海屏 / 底部横条）
- **body**：`padding-left/right/bottom: env(safe-area-inset-*)`，避免内容贴边或被底部指示条遮挡。
- **Header**：`pt-[env(safe-area-inset-top)]`，顶栏内容避开刘海/动态岛。
- **Footer**：`pb-[env(safe-area-inset-bottom)]`，底部留出安全区。

### 3. 触摸与点击
- **触摸目标**：主要按钮、链接、输入框使用 `min-h-[44px]`（约 44pt 最小点击区），符合 WCAG 与 iOS HIG。
- **触摸反馈**：在 `@media (hover: none)` 下对按钮、链接、输入、`.input` 设置 `-webkit-tap-highlight-color: transparent`、`touch-action: manipulation`，减少 300ms 延迟并统一点击高亮。
- **输入框**：`.input` 使用 `text-base`（16px），避免 iOS 聚焦时自动放大页面。

### 4. 布局与响应式
- **导航**：桌面端 `md:flex` 顶栏，移动端 `md:hidden` + 汉堡菜单，菜单项 `min-h-[44px]`。
- **栅格**：工具页、首页卡片等使用 `sm:grid-cols-2`、`lg:grid-cols-4` 等断点，小屏单列。
- **间距**：`px-4`、`py-8 sm:py-12` 等，小屏略收紧、大屏放宽。
- **表格**：Compare 页表格容器 `overflow-x-auto`，小屏提示「Swipe horizontally」。

### 5. 无障碍与动效
- **prefers-reduced-motion**：在 `globals.css` 中降低动画/过渡时长，并关闭平滑滚动。
- **焦点环**：按钮与链接使用 `focus-visible:ring-2` 等，键盘与焦点可见。

## 维护建议
- 新增按钮、链接、表单项时尽量沿用 `.btn-primary`、`.btn-secondary`、`.input`，或显式加 `min-h-[44px]`。
- 新增固定/粘性头尾时考虑 `env(safe-area-inset-*)`。
- 在真机或 Chrome DevTools 设备模式下做一次小屏与横竖屏检查。
