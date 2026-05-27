import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChapterNav } from "@/components/ChapterNav";
import { MapCanvas } from "@/components/MapCanvas";
import { NodeDetail } from "@/components/NodeDetail";
import { loadChapter, loadManifest } from "@/data/loadContent";
import type { NameLocale } from "@/data/nodeNames";
import { useGuideProgress } from "@/hooks/useGuideProgress";
import type { Chapter, Manifest } from "@/types/content";

const MIN_RIGHT_WIDTH = 320;
const MAX_RIGHT_WIDTH = 680;
const DEFAULT_RIGHT_WIDTH = 380;

export function GuidePage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const debug = searchParams.get("debug") === "1";

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT_WIDTH);
  const [nameLocale, setNameLocale] = useState<NameLocale>("international");
  const rightResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const rightResizeListenersRef = useRef<{ onMove: (ev: MouseEvent) => void; onUp: () => void } | null>(null);

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

  const toggleNameLocale = useCallback(() => {
    setNameLocale((current) => (current === "international" ? "chinese" : "international"));
  }, []);

  const cleanupRightResize = useCallback(() => {
    const listeners = rightResizeListenersRef.current;
    if (listeners) {
      window.removeEventListener("mousemove", listeners.onMove);
      window.removeEventListener("mouseup", listeners.onUp);
      rightResizeListenersRef.current = null;
    }
    rightResizeRef.current = null;
    document.body.classList.remove("resizing-panel");
  }, []);

  useEffect(() => cleanupRightResize, [cleanupRightResize]);

  const startRightResize = (e: React.MouseEvent) => {
    e.preventDefault();
    cleanupRightResize();
    rightResizeRef.current = { startX: e.clientX, startWidth: rightWidth };
    document.body.classList.add("resizing-panel");
    const onMove = (ev: MouseEvent) => {
      const d = rightResizeRef.current;
      if (!d) return;
      const next = d.startWidth - (ev.clientX - d.startX);
      setRightWidth(Math.min(MAX_RIGHT_WIDTH, Math.max(MIN_RIGHT_WIDTH, next)));
    };
    const onUp = () => {
      cleanupRightResize();
    };
    rightResizeListenersRef.current = { onMove, onUp };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

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
    <div className="guide-layout flex min-h-dvh gap-3 p-3">
      <aside className={`guide-left guide-box flex min-h-0 shrink-0 flex-col ${leftCollapsed ? "collapsed" : ""}`}>
        <div className="guide-left-top flex items-center gap-2 px-3 py-3">
          <Link to="/" className="guide-home-link">
            ← 首页
          </Link>
          {!leftCollapsed && (
            <span className="guide-progress-pill">
              {progress.flowIndex + 1} / {progress.flowOrder.length}
            </span>
          )}
          <button
            type="button"
            className="guide-collapse-btn ml-auto"
            onClick={() => setLeftCollapsed((v) => !v)}
            aria-label={leftCollapsed ? "展开左侧列表" : "收起左侧列表"}
          >
            {leftCollapsed ? "»" : "«"}
          </button>
        </div>
        <ChapterNav
          manifestChapters={manifest.chapters}
          activeChapterId={chapter.id}
          chapter={chapter}
          selectedNodeId={progress.selectedNodeId}
          currentNodeId={progress.currentNodeId}
          flowLabel={progress.flowLabel}
          getStatus={progress.getNodeStatus}
          nameLocale={nameLocale}
          collapsed={leftCollapsed}
          onSelectChapter={(id) => {
            navigate(`/guide/${id}`);
          }}
          onSelectNode={progress.selectNode}
        />
      </aside>

      <main className="guide-center guide-box min-w-0 flex-1">
        <MapCanvas
          chapter={chapter}
          activeMapId={activeMapId}
          selectedNodeId={progress.selectedNodeId}
          getStatus={progress.getNodeStatus}
          flowLabel={progress.flowLabel}
          onSelectNode={progress.selectNode}
          nameLocale={nameLocale}
          onToggleNameLocale={toggleNameLocale}
          debug={debug}
        />
      </main>

      <aside className="guide-right guide-box relative shrink-0" style={{ width: rightWidth }}>
        <button
          type="button"
          className="guide-resize-handle"
          onMouseDown={startRightResize}
          aria-label="调整右侧面板宽度"
        />
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
          onNext={() => {
            if (progress.isChapterEnd && !progress.isReviewing) {
              progress.goNext();
              const idx = manifest.chapters.findIndex((c) => c.id === chapter.id);
              const nextChapter = manifest.chapters[idx + 1];
              if (nextChapter) {
                navigate(`/guide/${nextChapter.id}`);
              }
              return;
            }
            progress.goNext();
          }}
          onSetAsCurrent={() => progress.setAsCurrent(progress.selectedNodeId)}
          onReturnToCurrent={progress.returnToCurrent}
          chapterId={chapter.id}
          nameLocale={nameLocale}
        />
      </aside>
    </div>
  );
}
