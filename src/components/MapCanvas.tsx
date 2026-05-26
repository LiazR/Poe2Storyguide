import { assetUrl } from "@/data/loadContent";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Chapter, StoryNode } from "@/types/content";

/** 界面上的 100% 对应实际缩放（原 135% 视觉大小） */
const BASE_SCALE = 1.35;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const DEFAULT_SCALE = BASE_SCALE;

const displayPercent = (scale: number) => Math.round((scale / BASE_SCALE) * 100);

/** 相对 map-overlay（与图片同尺寸）计算百分比坐标 */
function clientToOverlayPercent(
  clientX: number,
  clientY: number,
  overlay: HTMLElement,
): { x: number; y: number } {
  const rect = overlay.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  };
}

interface MapCanvasProps {
  chapter: Chapter;
  activeMapId: string;
  selectedNodeId: string;
  getStatus: (nodeId: string) => "completed" | "current" | "upcoming";
  flowLabel: (nodeId: string) => number;
  onSelectNode: (nodeId: string) => void;
  debug?: boolean;
}

export function MapCanvas({
  chapter,
  activeMapId,
  selectedNodeId,
  getStatus,
  flowLabel,
  onSelectNode,
  debug = false,
}: MapCanvasProps) {
  const map = chapter.maps.find((m) => m.id === activeMapId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [debugClick, setDebugClick] = useState<{ x: number; y: number } | null>(null);

  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number; moved: boolean } | null>(
    null,
  );

  const markers = useMemo(
    () => chapter.nodes.filter((n) => n.mapId === activeMapId),
    [chapter.nodes, activeMapId],
  );

  useEffect(() => {
    setScale(DEFAULT_SCALE);
    setPan({ x: 0, y: 0 });
    setDebugClick(null);
  }, [activeMapId]);

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const zoomAt = useCallback(
    (clientX: number, clientY: number, nextScale: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const clamped = clampScale(nextScale);
      const ratio = clamped / scale;
      setPan((p) => ({
        x: mx - (mx - p.x) * ratio,
        y: my - (my - p.y) * ratio,
      }));
      setScale(clamped);
    },
    [scale],
  );

  const zoomIn = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, scale * 1.2);
  };

  const zoomOut = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, scale / 1.2);
  };

  const resetView = () => {
    setScale(DEFAULT_SCALE);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomAt(e.clientX, e.clientY, scale * factor);
    },
    [scale, zoomAt],
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".marker-pin")) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
    setDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".marker-pin")) return;
    const t = e.touches[0];
    dragRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
    setDragging(true);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
      setPan({ x: d.panX + dx, y: d.panY + dy });
    };
    const onTouchMove = (e: TouchEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const t = e.touches[0];
      const dx = t.clientX - d.startX;
      const dy = t.clientY - d.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
      setPan({ x: d.panX + dx, y: d.panY + dy });
    };
    const onUp = (e: MouseEvent) => {
      const d = dragRef.current;
      if (d && debug && !d.moved && overlayRef.current) {
        const { x, y } = clientToOverlayPercent(e.clientX, e.clientY, overlayRef.current);
        const rx = Math.round(x * 10) / 10;
        const ry = Math.round(y * 10) / 10;
        setDebugClick({ x: rx, y: ry });
        console.log(
          `[debug] 复制到 JSON → "x": ${rx}, "y": ${ry}`,
          `\n  overlay 尺寸: ${overlayRef.current.getBoundingClientRect().width.toFixed(0)}×${overlayRef.current.getBoundingClientRect().height.toFixed(0)}px`,
        );
      }
      dragRef.current = null;
      setDragging(false);
    };
    const onTouchEnd = () => {
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove, { passive: false } as EventListenerOptions);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [debug]);

  if (!map) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--muted)]">
        未找到地图配置
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="map-toolbar flex shrink-0 flex-wrap items-center gap-2 px-3 py-3">
        <button type="button" className="map-tool-btn" onClick={zoomOut} aria-label="缩小">
          −
        </button>
        <span className="min-w-[3rem] text-center text-xs text-[var(--muted)]">
          {displayPercent(scale)}%
        </span>
        <button type="button" className="map-tool-btn" onClick={zoomIn} aria-label="放大">
          +
        </button>
        <button type="button" className="map-tool-btn ml-1" onClick={resetView}>
          复位
        </button>
        <span className="ml-2 hidden text-xs text-[var(--muted)] sm:inline">
          滚轮缩放 · 拖拽平移
        </span>
        {debug && (
          <span className="ml-2 text-xs text-amber-400">
            调试：点击地图 → 红圈=点击点，圆点中心应对齐
          </span>
        )}
      </div>

      <div
        ref={viewportRef}
        className={`map-viewport min-h-0 flex-1 ${dragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="map-stage"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
        >
          <div className="relative inline-block w-full max-w-[960px]">
            <img
              src={assetUrl(map.image)}
              alt={map.title}
              className="map-bg block h-auto w-full select-none"
              draggable={false}
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = "1";
                  img.src = assetUrl("/maps/act1.png");
                }
              }}
            />
            <div
              ref={overlayRef}
              className="map-overlay absolute inset-0"
              role="presentation"
            >
              {debug &&
                markers.map((node) => (
                  <div
                    key={`dbg-${node.id}`}
                    className="debug-anchor"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    title={`${node.id} x=${node.x} y=${node.y}`}
                  />
                ))}
              {debug && debugClick && (
                <div
                  className="debug-click"
                  style={{ left: `${debugClick.x}%`, top: `${debugClick.y}%` }}
                />
              )}
              {markers.map((node) => (
                <MapMarker
                  key={node.id}
                  node={node}
                  label={flowLabel(node.id)}
                  status={getStatus(node.id)}
                  selected={node.id === selectedNodeId}
                  onSelect={() => onSelectNode(node.id)}
                  debug={debug}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapMarker({
  node,
  label,
  status,
  selected,
  onSelect,
  debug,
}: {
  node: StoryNode;
  label: number;
  status: "completed" | "current" | "upcoming";
  selected: boolean;
  onSelect: () => void;
  debug?: boolean;
}) {
  const displayName = node.mapTitle ?? node.title;
  const badgeType = node.badge?.type ?? "quest";

  return (
    <div
      className={`marker-wrap ${status} ${selected ? "selected" : ""}`}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      data-node-id={node.id}
      data-x={node.x}
      data-y={node.y}
      title={debug ? `${node.id} · x=${node.x} y=${node.y}` : undefined}
    >
      <button
        type="button"
        className={`marker-pin ${status}`}
        title={node.hint ?? node.title}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <span className="marker-num">{label > 0 ? label : "?"}</span>
      </button>
      {(displayName || node.badge?.text) && (
        <div className="marker-labels">
          {displayName && <span className="marker-name">{displayName}</span>}
          {node.badge?.text && (
            <span className={`marker-badge badge-${badgeType}`}>{node.badge.text}</span>
          )}
        </div>
      )}
    </div>
  );
}
