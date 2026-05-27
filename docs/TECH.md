# 技术方案（MVP · 个人开发）

| 关联 | PRD v0.2、`页面交互方案.md` |
|------|---------------------------|
| 原则 | 不过度工程化、静态站、JSON 手填内容、mock 先行 |

---

## 1. 技术选型

| 项 | 选择 | 理由 |
|----|------|------|
| 框架 | **Vite + React 18 + TypeScript** | 生态熟、构建快、个人维护成本低 |
| 样式 | **Tailwind CSS 4** | 三栏布局 + 深色 wiki 风快 |
| 路由 | **react-router-dom**（2 条路由） | `/`、`/guide/:chapterId` |
| 状态 | **React useState + 单文件 hook** | 不引入 Zustand；进度逻辑 &lt; 150 行 |
| 持久化 | **localStorage** | 无后端 |
| 部署 | **静态托管**（GitHub Pages / Cloudflare Pages） | `npm run build` 即可 |

**明确不做（MVP）**：后端、数据库、CMS、i18n、PWA、单元测试框架、组件库全家桶。

---

## 2. 目录结构

```
Poe2Storyguide/
├── content/                    # 手填剧情数据（构建时拷贝到 public）
│   ├── manifest.json
│   └── chapters/
│       └── act1.json
├── public/
│   └── maps/                   # 地图截图（你手动放入）
│       └── act1-shore.jpg
├── src/
│   ├── types/
│   │   └── content.ts          # 与 JSON 一致的类型
│   ├── data/
│   │   └── loadChapter.ts      # fetch 章节 JSON
│   ├── hooks/
│   │   └── useGuideProgress.ts # 进度指针 + localStorage
│   ├── components/
│   │   ├── Layout/             # 三栏外壳
│   │   ├── ChapterNav.tsx      # 左：Act + 节点列表
│   │   ├── MapCanvas.tsx       # 中：背景图 + 节点 overlay
│   │   └── NodeDetail.tsx      # 右：详情 + 配图 + 上/下一步
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── GuidePage.tsx       # 核心工作台
│   ├── App.tsx
│   └── main.tsx
├── docs/
└── package.json
```

---

## 3. 数据结构设计（手填友好）

### 3.1 设计原则

- **一章一个 JSON**，编辑时只打开 `act1.json`，不用改代码。
- **节点字段扁平**：地图上需要的 `x/y/title/description/next` 都在节点上。
- **`flowOrder`**：章节级固定顺序（与 `next` 一致即可；以 `flowOrder` 为运行时权威，便于校验）。
- **坐标用百分比** `0–100`：换截图分辨率也不影响相对位置。
- **`next`**：下一节点 `id`；最后一节点为 `null`。手填时与 `flowOrder` 对齐。

### 3.2 `manifest.json`

```json
{
  "contentVersion": "0.1.0",
  "chapters": [
    { "id": "act1", "title": "Act 1", "file": "/content/chapters/act1.json" }
  ]
}
```

### 3.3 `chapters/act1.json`（完整 schema）

```json
{
  "id": "act1",
  "title": "Act 1",
  "flowOrder": ["node_intro", "node_camp", "node_boss"],
  "maps": [
    {
      "id": "act1_shore",
      "title": "海难海岸",
      "image": "/maps/act1-shore.jpg"
    }
  ],
  "nodes": [
    {
      "id": "node_intro",
      "mapId": "act1_shore",
      "x": 18,
      "y": 62,
      "title": "醒来与探索",
      "description": "沿海岸向北前进，找到幸存者。",
      "next": "node_camp",
      "hint": "海岸入口有光柱",
      "coverImage": null,
      "images": [],
      "steps": [
        { "title": "沿岸边前进", "body": "触发对话。" }
      ]
    }
  ]
}
```

### 3.4 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| **Chapter** | | |
| `id` | ✅ | 路由参数 `act1` |
| `title` | ✅ | 显示名 |
| `flowOrder` | ✅ | 主线顺序，节点 id 数组 |
| `maps[]` | ✅ | 本章所有地图页 |
| `nodes[]` | ✅ | 本章所有节点 |
| **Map** | | |
| `id` | ✅ | |
| `title` | ✅ | 左栏区域名 |
| `image` | ✅ | 相对 `public` 的路径 |
| **Node** | | |
| `id` | ✅ | 全局唯一（建议带章前缀） |
| `mapId` | ✅ | 落在哪张地图 |
| `x`, `y` | ✅ | **百分比**，相对地图容器左上 |
| `title` | ✅ | 列表与右栏标题 |
| `description` | ✅ | 右栏主文案 / 下一步提示摘要 |
| `next` | ✅ | 下一节点 id，`null` 表示章末 |
| `hint` | | 地图 hover 短摘要 |
| `coverImage` | | 右栏头图 URL |
| `images[]` | | `{ url, caption? }` |
| `steps[]` | | `{ title, body?, image? }` 阅读用 |

### 3.5 `flowOrder` 与 `next` 的关系

- 运行时 **只读 `flowOrder`** 做上一步/下一步。
- 手填后用脚本或肉眼保证：`flowOrder[i].next === flowOrder[i+1]`（MVP 可不做脚本，README 里写检查项）。
- 地图上 **序号** = `flowOrder` 中的下标 + 1（①②③），不按 `maps` 内单独编号。

### 3.6 多地图

- 节点 `mapId` 指向不同 `maps[].id`。
- 切换节点时：若 `mapId` 变化，`MapCanvas` 换 `background-image`，只渲染**当前地图上的节点**为 overlay（或渲染全部但隐藏非本图节点——MVP 只渲染当前图节点更简单）。

---

## 4. 地图标记点布局实现

### 4.1 DOM 结构（核心）

```
.map-viewport                    ← 可缩放平移的容器
  └── .map-stage                 ← transform: scale() translate()
        └── .map-bg              ← 背景图，width 100%，display block
        └── .map-overlay         ← position absolute; inset 0; 与底图同宽高
              └── button.marker  ← 每个节点，left: x%; top: y%; transform: translate(-50%,-50%)
```

- **背景图**：`<img class="map-bg" src={map.image} />` 或 `div` + `background-image`。
- **Overlay**：与图片**同尺寸包裹层**（`position: relative` 的 stage 内，img 下方叠一层 `absolute inset-0`）。
- **节点**：`left: ${x}%`; `top: ${y}%`; `transform: translate(-50%, -50%)` 使锚点在圆心。

### 4.2 缩放（MVP 简化）

- `map-stage` 使用 CSS `transform: scale(s)`，`s` 存在组件 state（0.5～2）。
- 工具条：`+` / `-` / `适应`（scale=1 且 scroll into view）/ `复位`。
- 编号点因在 stage 内，**随图缩放**，无需重算坐标。
- **不实现** 复杂画布引擎（Konva/Mapbox）；个人项目够用。

### 4.3 手填坐标工作流（给你）

1. 把截图放进 `public/maps/xxx.jpg`。
2. 在 `act1.json` 填 `maps[].image`。
3. 浏览器打开引导页，临时开启 **调试模式**（`?debug=1`）：点击地图记录 `x,y` 到 console 或浮层（MVP 在 `MapCanvas` 用 click 事件 `offsetX/offsetWidth*100`）。
4. 将数值写入对应节点的 `x`、`y`。
5. 微调直到标记与游戏地点对齐。

### 4.4 标记点 UI（wiki + 游戏地图风）

- 圆形徽章显示 **flow 序号**（1、2、3…）。
- 状态 class：`completed` | `current` | `upcoming` | `selected`。
- `title` 属性或 Popover 显示 `hint` / `title`（hover）。

---

## 5. 进度逻辑（已拍板规则）

| 操作 | 行为 |
|------|------|
| **下一步** | `completed` 加入当前节点；`flowIndex++`；`selectedNodeId = flowOrder[flowIndex]` |
| **上一步** | `flowIndex--`；**默认不**从 `completedNodeIds` 删除后续节点 |
| **设为当前节点** | `flowIndex = indexOf(node)`；将 `flowOrder[0..index-1]` **全部加入** `completedNodeIds` |
| **返回当前进度** | `selectedNodeId = flowOrder[flowIndex]`（查阅模式退出） |

`localStorage` key：`poe2storyguide_progress`

```json
{
  "contentVersion": "0.1.0",
  "chapterId": "act1",
  "flowIndex": 2,
  "selectedNodeId": "node_camp",
  "completedNodeIds": ["node_intro", "node_camp"]
}
```

---

## 6. 页面与组件职责

| 页面/组件 | 职责 |
|-----------|------|
| `HomePage` | 读 manifest；继续按钮 → `/guide/:chapterId` |
| `GuidePage` | 加载 chapter JSON；组合三栏 + `useGuideProgress` |
| `ChapterNav` | Act 列表（manifest）；当前章 flow 列表；点击设 `selectedNodeId` |
| `MapCanvas` | 当前 `mapId` 的底图 + markers；缩放条；marker 点击 |
| `NodeDetail` | 选中节点详情、配图、`上一步/下一步/设为当前/返回进度` |

**查阅模式**：`selectedNodeId !== flowOrder[flowIndex]` 时显示黄条 +「返回当前进度」。

---

## 7. UI 风格（游戏地图 + wiki）

- **背景**：深灰 `#1a1b1e`（wiki 夜览感）。
- **侧栏**：略浅 `#25262b`，细边框分隔。
- **强调色**：琥珀金 `#c9a227`（当前节点、下一步按钮，贴近 POE 掉色气质）。
- **字体**：系统无衬线；正文 14–15px，提示 13px。
- **地图区**：浅黑底 + 截图投影；标记点高对比描边。
- **右栏**：标题大号；步骤列表类似 wiki 条目；配图 `rounded` + 点击放大（MVP 可用 `<dialog>` 或新窗口）。

---

## 8. 开发阶段（建议顺序）

| 阶段 | 产出 | 估时（个人） |
|------|------|--------------|
| **S0** | 本方案 + 类型 + mock JSON + 空截图占位 | 0.5d |
| **S1** | `MapCanvas` 底图 + 百分比 marker + debug 点选坐标 | 0.5d |
| **S2** | `GuidePage` 三栏 + `NodeDetail` 静态展示 | 1d |
| **S3** | `useGuideProgress` + 上一步/下一步/设为当前 | 0.5d |
| **S4** | `HomePage` + 继续 + localStorage | 0.5d |
| **S5** | 缩放工具条 + hover + 移动端基础折叠 | 1d |
| **S6** | 你填入 Act1 真实截图与节点 | 内容 |

---

## 9. 内容维护 checklist

- [ ] `flowOrder` 与每个 `node.next` 链一致
- [ ] 每个 `flowOrder` 里的 id 在 `nodes` 中存在
- [ ] 每个节点的 `mapId` 在 `maps` 中存在
- [ ] `x,y` 在 0–100 内
- [ ] 图片路径以 `/maps/` 开头且文件存在于 `public/maps/`

---

## 10. 后续可选（非 MVP）

- `npm run validate` 小脚本校验 JSON
- 剧透开关、深色已在 CSS 变量
- 搜索、多章路由已完成可扩展

---

*实现代码见仓库 `src/`；手填数据编辑 `content/`，运行 `npm run content:sync` 同步到 `public/content/`。*

---

## 11. 仓库现状（MVP 脚手架）

| 路径 | 说明 |
|------|------|
| `src/components/MapCanvas.tsx` | 背景图 + 百分比 overlay 标记点 + 缩放 + `?debug=1` 坐标 |
| `src/hooks/useGuideProgress.ts` | 下一步/上一步/设为当前 + localStorage |
| `content/chapters/act1.json` | 3 节点 mock，可替换为真实数据 |
| `public/maps/` | 放置游戏截图 |

本地启动：`npm install` → `npm run content:sync` → `npm run dev` → `/guide/act1`
