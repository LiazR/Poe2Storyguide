/** 与 content/chapters/*.json 字段一致，手填时对照此结构 */

export interface Manifest {
  contentVersion: string;
  chapters: ManifestChapter[];
}

export interface ManifestChapter {
  id: string;
  title: string;
  file: string;
}

export interface ChapterMap {
  id: string;
  title: string;
  /** 相对站点根路径，如 /maps/act1-shore.jpg */
  image: string;
}

export interface NodeImage {
  url: string;
  caption?: string;
}

export interface NodeStep {
  title: string;
  body?: string;
  image?: string;
}

export interface StoryNode {
  id: string;
  mapId: string;
  /** 相对地图容器左上，百分比 0–100 */
  x: number;
  y: number;
  title: string;
  description: string;
  /** 下一节点 id；章末为 null */
  next: string | null;
  hint?: string;
  /** 地图上圆点下方显示的名称，不填则用 title */
  mapTitle?: string;
  /** 名称下方短标签，最多约 6 字；type 决定颜色 */
  badge?: {
    text: string;
    type?: "waypoint" | "boss" | "skill" | "quest" | "danger" | "loot";
  };
  coverImage?: string | null;
  images?: NodeImage[];
  steps?: NodeStep[];
}

export interface Chapter {
  id: string;
  title: string;
  flowOrder: string[];
  maps: ChapterMap[];
  nodes: StoryNode[];
}

export interface GuideProgress {
  contentVersion: string;
  chapterId: string;
  flowIndex: number;
  selectedNodeId: string;
  completedNodeIds: string[];
}
