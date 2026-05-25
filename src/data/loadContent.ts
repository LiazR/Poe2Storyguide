import type { Chapter, Manifest } from "@/types/content";

export async function loadManifest(): Promise<Manifest> {
  const res = await fetch("/content/manifest.json");
  if (!res.ok) throw new Error("无法加载 manifest.json");
  return res.json() as Promise<Manifest>;
}

export async function loadChapter(file: string): Promise<Chapter> {
  const res = await fetch(file);
  if (!res.ok) throw new Error(`无法加载章节: ${file}`);
  return res.json() as Promise<Chapter>;
}
