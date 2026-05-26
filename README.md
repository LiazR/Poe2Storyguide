# Poe2Storyguide

一个面向《Path of Exile 2 / 流放之路 2》的剧情流程辅助站点，提供章节地图、流程节点、任务提示、奖励标记和节点详情，帮助玩家在跑剧情时快速确认下一步要去哪里、要拿什么奖励、哪些内容可以跳过。

## 项目亮点

- **章节化攻略**：已支持 Act 1 ~ Act 4，每章独立维护 JSON 内容。
- **地图节点导航**：在章节地图上展示任务节点，支持点击节点查看详细攻略。
- **流程推进**：支持下一步、上一步、设为当前节点，自动记录已完成进度。
- **右侧详情面板**：展示节点说明、分步攻略、奖励 badge、攻略图片。
- **图片查看器**：节点图片支持点击放大、拖拽移动和缩放查看。
- **移动端交互**：地图支持触摸拖动，适合手机/平板查看。
- **内容数据分离**：攻略内容由 `content/` 下 JSON 驱动，方便持续补充和维护。

## 预览

项目运行后可访问：

- 首页：`http://localhost:5173/`
- 攻略页：`http://localhost:5173/guide/act1`
- 坐标调试：`http://localhost:5173/guide/act1?debug=1`

坐标调试模式下点击地图，会在控制台输出当前点击位置的 `x / y` 百分比坐标，便于维护节点位置。

## 技术栈

- [Vite](https://vite.dev/)：前端构建工具
- [React](https://react.dev/)：页面与组件开发
- [TypeScript](https://www.typescriptlang.org/)：类型约束
- [Tailwind CSS 4](https://tailwindcss.com/)：样式系统
- [React Router](https://reactrouter.com/)：路由管理

## 快速开始

```bash
npm install
npm run dev
```

`npm run dev` 会启动内容同步监听，将 `content/` 中的攻略 JSON 同步到 `public/content/`。

如果需要单独启动 Vite：

```bash
npm run dev:vite
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 监听并同步攻略内容到 `public/content/` |
| `npm run dev:vite` | 启动 Vite 开发服务器 |
| `npm run content:sync` | 手动同步 `content/` 到 `public/content/` |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 本地预览生产构建 |

## 内容结构

```text
content/
  manifest.json              # 章节入口配置
  chapters/
    act1.json                # 第一章攻略内容
    act2.json                # 第二章攻略内容
    act3.json                # 第三章攻略内容
    act4.json                # 第四章攻略内容

public/
  maps/                      # 章节地图图片
  InfoMap/                   # 节点详情图片
  content/                   # 同步后的运行时内容

src/
  components/                # 页面组件
  data/                      # 内容加载逻辑
  hooks/                     # 进度状态逻辑
  pages/                     # 页面入口
  types/                     # 内容类型定义
```

## 攻略 JSON 示例

每个节点使用统一的数据结构：

```json
{
  "id": "node_1",
  "mapId": "act1",
  "x": 15,
  "y": 69,
  "title": "河岸",
  "mapTitle": "河岸",
  "description": "右侧详情说明，可使用\\n分段。",
  "next": "node_2",
  "hint": "鼠标悬浮节点时显示的提示",
  "badge": { "text": "+2天赋", "type": "skill" },
  "steps": [
    { "title": "步骤一", "body": "步骤说明" }
  ],
  "images": [
    { "url": "/InfoMap/Act1_Node1.png" }
  ]
}
```

字段说明：

| 字段 | 说明 |
|------|------|
| `id` | 节点唯一 ID，章节内通常使用 `node_1`、`node_2` |
| `mapId` | 所属地图 ID，应与章节地图配置一致 |
| `x` / `y` | 节点在地图上的百分比坐标 |
| `title` | 右侧详情完整标题 |
| `mapTitle` | 地图节点短标题 |
| `description` | 右侧详情说明，支持 `\n` 分段 |
| `next` | 下一个节点 ID，最后一个节点为 `null` |
| `hint` | 节点悬浮提示 |
| `badge` | 可选奖励标记，仅在有奖励时填写 |
| `steps` | 可选分步攻略，适合复杂节点 |
| `images` | 可选节点图片，点击可放大查看 |

更详细的内容编写说明见 [docs/内容填写指南.md](docs/内容填写指南.md)。

## 如何添加新章节

1. 在 `content/chapters/` 下新增章节 JSON，例如 `act5.json`。
2. 在 `content/manifest.json` 中注册章节：

```json
{ "id": "act5", "title": "Act 5", "file": "/content/chapters/act5.json" }
```

3. 将地图图片放入 `public/maps/`，并在章节 JSON 中引用：

```json
"image": "/maps/act5.png"
```

4. 同步内容：

```bash
npm run content:sync
```

## 坐标维护

访问调试地址：

```text
http://localhost:5173/guide/act1?debug=1
```

点击地图后，浏览器控制台会输出当前位置坐标。将输出的 `x`、`y` 写入对应节点即可。

## 构建部署

```bash
npm run build
```

构建产物位于 `dist/`，可部署到任意静态托管服务，例如 GitHub Pages、Vercel、Netlify 或自己的静态服务器。

部署前建议确认：

- 已执行 `npm run content:sync`
- `public/content/` 中存在最新章节 JSON
- `public/maps/` 中存在章节地图图片
- `public/InfoMap/` 中存在节点详情图片

## 当前进度

- Act 1：已完成主流程内容与部分节点图片
- Act 2：已完成主流程内容与部分节点图片
- Act 3：已完成主流程内容与部分节点图片
- Act 4：已完成主流程内容
- 后续计划：继续优化 UI、补充图片资源、完善更多章节内容

## 免责声明

本项目为玩家自用/学习性质的非官方攻略工具，与 Grinding Gear Games 或 Path of Exile 官方无关联。游戏内容、地图、名称与相关素材版权归其原始权利方所有。

## License

如需公开发布，建议根据实际素材授权情况补充合适的开源协议。当前仓库中的游戏截图与素材请在确认版权和使用范围后再进行分发。
