import type { Chapter, Manifest } from "@/types/content";

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export async function loadManifest(): Promise<Manifest> {
  const res = await fetch(assetUrl("/content/manifest.json"));
  if (!res.ok) throw new Error("无法加载 manifest.json");
  return res.json() as Promise<Manifest>;
}

export async function loadChapter(file: string): Promise<Chapter> {
  const res = await fetch(assetUrl(file));
  if (!res.ok) throw new Error(`无法加载章节: ${file}`);
  return res.json() as Promise<Chapter>;
}
