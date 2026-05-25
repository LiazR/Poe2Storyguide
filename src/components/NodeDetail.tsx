import { useState } from "react";
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

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <p className="text-xs text-[var(--muted)]">
          进度 {flowIndex + 1} / {flowTotal}
        </p>

        {node.coverImage && (
          <img
            src={node.coverImage}
            alt=""
            className="mt-4 w-full rounded-lg border border-[var(--border)]"
          />
        )}

        <h1 className="mt-4 text-xl font-semibold">
          <span className="text-[var(--accent)]">{flowLabel}.</span> {node.title}
        </h1>

        <p className="mt-2 leading-relaxed whitespace-pre-line text-[var(--muted)]">{node.description}</p>

        {node.images && node.images.length > 0 && (
          <div className="mt-3 grid gap-2">
            {node.images.map((img) => (
              <button
                key={img.url}
                type="button"
                className="block overflow-hidden rounded-lg border border-[var(--border)]"
                onClick={() => setLightbox(img.url)}
              >
                <img src={img.url} alt={img.caption ?? ""} className="w-full" />
              </button>
            ))}
          </div>
        )}

        {node.steps && node.steps.length > 0 && (
          <ol className="wiki-steps mt-4 list-decimal space-y-3 pl-5">
            {node.steps.map((step) => (
              <li key={step.title} className="pl-1">
                <strong>{step.title}</strong>
                {step.body && <p className="mt-1 text-[var(--muted)]">{step.body}</p>}
                {step.image && (
                  <img
                    src={step.image}
                    alt=""
                    className="mt-2 max-w-full rounded border border-[var(--border)]"
                  />
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="detail-actions shrink-0 flex flex-wrap gap-2 border-t border-[var(--border)] p-4">
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

      {lightbox && (
        <dialog open className="lightbox" onClose={() => setLightbox(null)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="关闭"
          >
            ×
          </button>
          <img src={lightbox} alt="" />
        </dialog>
      )}
    </div>
  );
}
