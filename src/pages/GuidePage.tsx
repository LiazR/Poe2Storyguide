import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChapterNav } from "@/components/ChapterNav";
import { MapCanvas } from "@/components/MapCanvas";
import { NodeDetail } from "@/components/NodeDetail";
import { loadChapter, loadManifest } from "@/data/loadContent";
import { useGuideProgress } from "@/hooks/useGuideProgress";
import type { Chapter, Manifest } from "@/types/content";

export function GuidePage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [searchParams] = useSearchParams();
  const debug = searchParams.get("debug") === "1";

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManifest()
      .then((m) => {
        setManifest(m);
        const entry = m.chapters.find((c) => c.id === chapterId);
        if (!entry) {
          setError("章节不存在");
          return;
        }
        return loadChapter(entry.file).then(setChapter);
      })
      .catch((e) => setError(String(e)));
  }, [chapterId]);

  const progress = useGuideProgress(
    chapter ?? {
      id: "",
      title: "",
      flowOrder: [],
      maps: [],
      nodes: [],
    },
    manifest?.contentVersion ?? "0.0.0",
  );

  const selectedNode = useMemo(
    () => chapter?.nodes.find((n) => n.id === progress.selectedNodeId),
    [chapter, progress.selectedNodeId],
  );

  const activeMapId = selectedNode?.mapId ?? chapter?.maps[0]?.id ?? "";

  if (error) {
    return (
      <p className="p-8">
        {error} · <Link to="/">返回首页</Link>
      </p>
    );
  }

  if (!chapter || !manifest || !progress.hydrated) {
    return <p className="p-8 text-[var(--muted)]">加载中…</p>;
  }

  return (
    <div className="guide-layout flex h-dvh flex-col">
      <header className="guide-header flex shrink-0 items-center gap-4 border-b border-[var(--border)] px-4 py-2">
        <Link to="/" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">
          ← 首页
        </Link>
        <h1 className="text-sm font-semibold">{chapter.title}</h1>
        <span className="text-xs text-[var(--muted)]">
          {progress.flowIndex + 1} / {progress.flowOrder.length}
        </span>
      </header>

      <div className="guide-panels min-h-0 flex flex-1">
        <aside className="guide-left shrink-0 border-r border-[var(--border)]">
          <ChapterNav
            manifestChapters={manifest.chapters}
            activeChapterId={chapter.id}
            chapter={chapter}
            selectedNodeId={progress.selectedNodeId}
            currentNodeId={progress.currentNodeId}
            flowLabel={progress.flowLabel}
            getStatus={progress.getNodeStatus}
            onSelectChapter={(id) => {
              window.location.href = `/guide/${id}`;
            }}
            onSelectNode={progress.selectNode}
          />
        </aside>

        <main className="guide-center min-w-0 flex-1 border-r border-[var(--border)]">
          <MapCanvas
            chapter={chapter}
            activeMapId={activeMapId}
            selectedNodeId={progress.selectedNodeId}
            getStatus={progress.getNodeStatus}
            flowLabel={progress.flowLabel}
            onSelectNode={progress.selectNode}
            debug={debug}
          />
        </main>

        <aside className="guide-right shrink-0">
          <NodeDetail
            node={selectedNode}
            flowIndex={progress.flowIndex}
            flowTotal={progress.flowOrder.length}
            flowLabel={progress.flowLabel(progress.selectedNodeId)}
            currentNodeId={progress.currentNodeId}
            isReviewing={progress.isReviewing}
            canGoPrev={progress.canGoPrev}
            canGoNext={!progress.isChapterEnd || progress.isReviewing}
            onPrev={progress.goPrev}
            onNext={progress.goNext}
            onSetAsCurrent={() => progress.setAsCurrent(progress.selectedNodeId)}
            onReturnToCurrent={progress.returnToCurrent}
          />
        </aside>
      </div>
    </div>
  );
}
