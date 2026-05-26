import manifest from "../../content/manifest.json";
import act1 from "../../content/chapters/act1.json";
import act2 from "../../content/chapters/act2.json";
import act3 from "../../content/chapters/act3.json";
import act4 from "../../content/chapters/act4.json";
import type { Chapter, Manifest } from "@/types/content";

const chapters: Record<string, Chapter> = {
  "/content/chapters/act1.json": act1 as Chapter,
  "/content/chapters/act2.json": act2 as Chapter,
  "/content/chapters/act3.json": act3 as Chapter,
  "/content/chapters/act4.json": act4 as Chapter,
};

export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export async function loadManifest(): Promise<Manifest> {
  return manifest as Manifest;
}

export async function loadChapter(file: string): Promise<Chapter> {
  const chapter = chapters[file];
  if (!chapter) throw new Error(`无法加载章节: ${file}`);
  return chapter;
}
