import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadManifest } from "@/data/loadContent";
import type { Manifest } from "@/types/content";

const STORAGE_KEY = "poe2storyguide_progress";

const featureCards = [
  { title: "地图节点", body: "章节地图上直观看到路线、奖励点和任务目标。" },
  { title: "流程推进", body: "按下一步跟随主线，已完成节点会自动记录。" },
  { title: "图文攻略", body: "右侧详情支持分步说明、奖励标记和图片放大。" },
];

const stats = [
  { value: "4", label: "已整理章节" },
  { value: "80+", label: "流程节点" },
  { value: "移动端", label: "触摸拖图" },
];

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
  const continueChapter = useMemo(
    () => manifest?.chapters.find((chapter) => chapter.id === continueChapterId) ?? null,
    [continueChapterId, manifest],
  );

  const handleResetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setContinueChapterId(null);
  };

  return (
    <main className="home-shell h-screen overflow-hidden px-4 py-4 text-[var(--text)] sm:px-6 lg:px-8">
      <div className="home-glow home-glow-a" />
      <div className="home-glow home-glow-b" />

      <section className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-4">
        <div className="home-hero-card">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,162,39,0.35)] bg-[rgba(201,162,39,0.08)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              PoE2 Story Guide · 非官方剧情辅助
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              跑剧情不迷路，
              <span className="block text-[var(--accent)]">下一步直接看地图。</span>
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              将章节地图、关键任务、奖励节点和图文攻略整合在一个页面中。边玩边查，按节点推进，快速确认当前要去哪里、要打什么、哪些奖励不能漏。
            </p>

            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              {continueChapter ? (
                <Link to={`/guide/${continueChapter.id}`} className="home-primary-btn">
                  继续剧情 · {continueChapter.title}
                </Link>
              ) : null}
              {first ? (
                <Link to={`/guide/${first.id}`} className={continueChapter ? "home-secondary-btn" : "home-primary-btn"}>
                  {continueChapter ? "从 Act 1 浏览" : `开始 · ${first.title}`}
                </Link>
              ) : null}
              <button type="button" onClick={handleResetProgress} className="home-secondary-btn">
                重置进度
              </button>
            </div>

            <div className="mx-auto mt-5 grid max-w-2xl grid-cols-3 gap-2">
              {stats.map((item) => (
                <div key={item.label} className="home-stat-card">
                  <div className="text-lg font-black text-[var(--accent)]">{item.value}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {featureCards.map((card) => (
            <article key={card.title} className="home-feature-card">
              <h2 className="text-base font-bold text-[var(--text)]">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{card.body}</p>
            </article>
          ))}
        </div>

        {manifest ? (
          <section className="home-section-card">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black">选择章节</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">当前内容版本 {manifest.contentVersion}，选择章节后进入地图流程。</p>
              </div>
              {continueChapter ? <span className="text-xs text-[var(--muted)]">上次停留：{continueChapter.title}</span> : null}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {manifest.chapters.map((chapter, index) => {
                const isContinue = chapter.id === continueChapter?.id;
                return (
                  <Link key={chapter.id} to={`/guide/${chapter.id}`} className="home-chapter-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Chapter {index + 1}</div>
                        <div className="mt-1 text-base font-black text-[var(--text)]">{chapter.title}</div>
                      </div>
                      {isContinue ? <span className="home-current-chip">继续</span> : null}
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/60">
                      <div className="h-full origin-left rounded-full bg-[var(--accent)]" style={{ width: isContinue ? "66%" : "0%" }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
