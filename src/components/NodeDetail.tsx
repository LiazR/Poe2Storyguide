import { assetUrl } from "@/data/loadContent";
import { createPortal } from "react-dom";
import { useCallback, useRef, useState } from "react";
import type { StoryNode } from "@/types/content";

interface NodeDetailProps {
  node: StoryNode | undefined;
  flowIndex: number;
  flowTotal: number;
  flowLabel: number;
  currentNodeId: string;
  isReviewing: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSetAsCurrent: () => void;
  onReturnToCurrent: () => void;
}

export function NodeDetail({
  node,
  flowIndex,
  flowTotal,
  flowLabel,
  currentNodeId,
  isReviewing,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onSetAsCurrent,
  onReturnToCurrent,
}: NodeDetailProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lbZoom, setLbZoom] = useState(1);
  const [lbPan, setLbPan] = useState({ x: 0, y: 0 });
  const lbDragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    setLbZoom(1);
    setLbPan({ x: 0, y: 0 });
  }, []);

  if (!node) {
    return (
      <div className="p-4 text-[var(--muted)]">请从地图或左侧列表选择节点</div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {isReviewing && (
        <div className="review-banner shrink-0 px-4 py-2 text-sm">
          正在查阅此节点。当前进度在流程第 {flowIndex + 1} 节。
          <button type="button" className="ml-2 underline" onClick={onReturnToCurrent}>
            返回当前进度
          </button>
        </div>
      )}

      <div className="node-detail-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <p className="text-xs text-[var(--muted)]">
          进度 {flowIndex + 1} / {flowTotal}
        </p>

        {node.coverImage && (
          <img
            src={assetUrl(node.coverImage)}
            alt=""
            className="mt-4 w-full rounded-lg border border-[var(--border)]"
          />
        )}

        <h1 className="mt-4 text-xl font-semibold">
          <span className="text-[var(--accent)]">{flowLabel}.</span> {node.title}
        </h1>

        {node.images && node.images.length > 0 && (
          <div className="mt-3 grid gap-2">
            {node.images.map((img) => (
              <button
                key={img.url}
                type="button"
                className="detail-image-card block cursor-zoom-in overflow-hidden rounded-xl"
                onClick={() => setLightbox(assetUrl(img.url))}
              >
                <img src={assetUrl(img.url)} alt={img.caption ?? ""} className="w-full" />
                {img.caption && (
                  <p className="px-2 py-1 text-xs text-[var(--muted)]">{img.caption}</p>
                )}
              </button>
            ))}
          </div>
        )}

        <p className="mt-2 leading-relaxed whitespace-pre-line text-[var(--muted)]">{node.description}</p>

        {node.steps && node.steps.length > 0 && (
          <ol className="wiki-steps mt-4 list-decimal space-y-3 pl-5">
            {node.steps.map((step) => (
              <li key={step.title} className="pl-1">
                <strong>{step.title}</strong>
                {step.body && <p className="mt-1 text-[var(--muted)]">{step.body}</p>}
                {step.image && (
                  <img
                    src={assetUrl(step.image)}
                    alt=""
                    className="mt-2 max-w-full rounded border border-[var(--border)]"
                  />
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="detail-actions shrink-0 flex flex-wrap gap-2 p-4">
        <button type="button" className="btn-secondary" disabled={!canGoPrev} onClick={onPrev}>
          上一步
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {canGoNext ? "下一步" : "已完成本章流程"}
        </button>
        {isReviewing && node.id !== currentNodeId && (
          <button type="button" className="btn-secondary w-full" onClick={onSetAsCurrent}>
            设为我的当前节点
          </button>
        )}
      </div>

      {lightbox && createPortal(
        <div
          className="lightbox"
          onWheel={(e) => {
            e.stopPropagation();
            const delta = e.deltaY > 0 ? -0.15 : 0.15;
            setLbZoom((z) => Math.min(5, Math.max(0.3, z + delta)));
          }}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            lbDragRef.current = { startX: e.clientX, startY: e.clientY, panX: lbPan.x, panY: lbPan.y };
            const onMove = (ev: MouseEvent) => {
              const d = lbDragRef.current;
              if (!d) return;
              setLbPan({ x: d.panX + ev.clientX - d.startX, y: d.panY + ev.clientY - d.startY });
            };
            const onUp = () => {
              lbDragRef.current = null;
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="关闭"
          >
            ×
          </button>
          <div className="lightbox-toolbar">
            <button
              type="button"
              className="lightbox-btn"
              onClick={() => setLbZoom((z) => Math.min(5, z + 0.25))}
            >
              +
            </button>
            <span className="text-xs text-white/70">{Math.round(lbZoom * 100)}%</span>
            <button
              type="button"
              className="lightbox-btn"
              onClick={() => setLbZoom((z) => Math.max(0.3, z - 0.25))}
            >
              −
            </button>
            <button
              type="button"
              className="lightbox-btn"
              onClick={() => { setLbZoom(1); setLbPan({ x: 0, y: 0 }); }}
            >
              复位
            </button>
          </div>
          <img
            src={lightbox}
            alt=""
            className="lightbox-img"
            draggable={false}
            style={{
              transform: `translate(${lbPan.x}px, ${lbPan.y}px) scale(${lbZoom})`,
            }}
          />
        </div>,
        document.body,
      )}
    </div>
  );
}
