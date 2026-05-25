import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadManifest } from "@/data/loadContent";
import type { Manifest } from "@/types/content";

const STORAGE_KEY = "poe2storyguide_progress";

export function HomePage() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [continueChapterId, setContinueChapterId] = useState<string | null>(null);

  useEffect(() => {
    loadManifest().then(setManifest).catch(console.error);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { chapterId?: string };
        if (p.chapterId) setContinueChapterId(p.chapterId);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const first = manifest?.chapters[0];

  return (
    <div className="home-page mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-bold text-[var(--accent)]">流放之路2 · 剧情流程辅助</h1>
      <p className="mt-2 text-[var(--muted)]">
        游戏地图 + 攻略 wiki。边玩边查，按节点点击「下一步」跟随进度。
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {continueChapterId && (
          <Link to={`/guide/${continueChapterId}`} className="btn-primary text-center">
            继续剧情
          </Link>
        )}
        {first && (
          <Link
            to={`/guide/${first.id}`}
            className={continueChapterId ? "btn-secondary text-center" : "btn-primary text-center"}
          >
            {continueChapterId ? "从头浏览" : "开始"} — {first.title}
          </Link>
        )}
      </div>

      {manifest && (
        <ul className="mt-10 space-y-2 border-t border-[var(--border)] pt-6">
          {manifest.chapters.map((c) => (
            <li key={c.id}>
              <Link to={`/guide/${c.id}`} className="text-[var(--text)] hover:text-[var(--accent)]">
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-xs text-[var(--muted)]">
        内容版本 {manifest?.contentVersion ?? "—"} · 非官方工具
      </p>
    </div>
  );
}
