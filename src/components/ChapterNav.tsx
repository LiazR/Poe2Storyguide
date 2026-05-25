import type { Chapter } from "@/types/content";
import type { ManifestChapter } from "@/types/content";

interface ChapterNavProps {
  manifestChapters: ManifestChapter[];
  activeChapterId: string;
  chapter: Chapter;
  selectedNodeId: string;
  currentNodeId: string;
  flowLabel: (nodeId: string) => number;
  getStatus: (nodeId: string) => "completed" | "current" | "upcoming";
  onSelectChapter: (id: string) => void;
  onSelectNode: (nodeId: string) => void;
}

export function ChapterNav({
  manifestChapters,
  activeChapterId,
  chapter,
  selectedNodeId,
  currentNodeId,
  flowLabel,
  getStatus,
  onSelectChapter,
  onSelectNode,
}: ChapterNavProps) {
  return (
    <nav className="flex h-full flex-col text-sm">
      <div className="border-b border-[var(--border)] px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          章节
        </h2>
        <ul className="mt-2 space-y-1">
          {manifestChapters.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`chapter-tab w-full rounded px-2 py-1.5 text-left ${
                  c.id === activeChapterId ? "active" : ""
                }`}
                onClick={() => onSelectChapter(c.id)}
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          主线流程
        </h2>
        <ul className="mt-2 space-y-0.5">
          {chapter.flowOrder.map((nodeId) => {
            const node = chapter.nodes.find((n) => n.id === nodeId);
            if (!node) return null;
            const status = getStatus(nodeId);
            const num = flowLabel(nodeId);
            return (
              <li key={nodeId}>
                <button
                  type="button"
                  className={`node-list-item w-full rounded px-2 py-2 text-left ${status} ${
                    selectedNodeId === nodeId ? "selected" : ""
                  }`}
                  onClick={() => onSelectNode(nodeId)}
                >
                  <span className="node-list-num">{num}</span>
                  <span className="min-w-0 flex-1 truncate">{node.title}</span>
                  {nodeId === currentNodeId && (
                    <span className="shrink-0 text-[10px] text-[var(--accent)]">当前</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
