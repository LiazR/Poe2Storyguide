# Poe2Storyguide · 流放之路2 剧情流程辅助

MVP 静态站：左章节 · 中地图（截图 + 标记点）· 右攻略详情。

## 快速开始

```bash
npm install
npm run dev
```

- 首页：http://localhost:5173/
- 引导页：http://localhost:5173/guide/act1
- **调试坐标**：http://localhost:5173/guide/act1?debug=1 → 点击地图，控制台输出 `x, y`

### 改完怎么看效果？（不用重启 dev）

| 改了什么 | 操作 |
|----------|------|
| `content/` 里 JSON | 保存 → **F5 刷新**（dev 自动 sync） |
| `public/maps/` 里 PNG | 保存 → **F5 刷新** |
| `src/` 里代码 | 保存 → 浏览器**自动更新** |

## 文档

| 文件 | 说明 |
|------|------|
| [docs/PRD.md](docs/PRD.md) | 产品需求 |
| [docs/页面交互方案.md](docs/页面交互方案.md) | 交互流程 |
| [docs/TECH.md](docs/TECH.md) | 技术方案 |

## 如何添加内容（手动）

**详细图文说明见 → [docs/内容填写指南.md](docs/内容填写指南.md)**

| 操作 | 位置 |
|------|------|
| 改节点、坐标、名称 | `content/chapters/act1.json` |
| 放 PNG 地图 | `public/maps/你的图.png` |
| 引用地图 | JSON 里 `"image": "/maps/你的图.png"` |
| 取坐标 | `/guide/act1?debug=1` 点击地图看控制台 |

改完务必：`npm run content:sync`（若 `npm run dev` 已在跑，**保存 JSON 后会自动 sync，只需 F5 刷新**）

## 进度规则（已实现）

- **下一步**：当前节点记入已完成，指针 +1
- **上一步**：指针 -1，**不**自动取消后面节点的已完成
- **设为我的当前节点**：指针对齐该节点，**之前节点全部标为已完成**

## 构建部署

```bash
npm run build
```

将 `dist/` 部署到任意静态托管；确保 `content/` 与 `maps/` 一并出现在输出目录（Vite 会把 `public/` 与需放在 `public/content` 的 JSON 处理——见下）。

### 内容文件位置

开发时 JSON 在仓库根目录 `content/`。部署前请将 `content` 复制到 `public/content`，或把 `content` 挪到 `public/content` 下维护（与 `fetch('/content/...')` 路径一致）。当前 mock 已通过 Vite 需放在 public：

**推荐**：把整个 `content` 文件夹放在 `public/content/` 下。

若 `npm run dev` 无法加载章节，执行：

```bash
# Windows PowerShell
Copy-Item -Recurse -Force content public/content
```

## 技术栈

Vite · React · TypeScript · Tailwind CSS 4 · react-router-dom
