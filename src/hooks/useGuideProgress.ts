import { useCallback, useEffect, useMemo, useState } from "react";
import type { Chapter, GuideProgress } from "@/types/content";

const STORAGE_KEY = "poe2storyguide_progress";

function loadStored(chapterId: string, version: string): GuideProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as GuideProgress;
    if (p.chapterId !== chapterId || p.contentVersion !== version) return null;
    return p;
  } catch {
    return null;
  }
}

function saveProgress(p: GuideProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useGuideProgress(chapter: Chapter, contentVersion: string) {
  const { flowOrder } = chapter;

  const [flowIndex, setFlowIndex] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState(flowOrder[0] ?? "");
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored(chapter.id, contentVersion);
    if (stored) {
      const max = Math.max(0, flowOrder.length - 1);
      const idx = Math.min(stored.flowIndex, max);
      setFlowIndex(idx);
      setSelectedNodeId(stored.selectedNodeId || flowOrder[idx] || "");
      setCompletedNodeIds(stored.completedNodeIds ?? []);
    } else {
      setFlowIndex(0);
      setSelectedNodeId(flowOrder[0] ?? "");
      setCompletedNodeIds([]);
    }
    setHydrated(true);
  }, [chapter.id, contentVersion, flowOrder]);

  const persist = useCallback(
    (patch: Partial<GuideProgress>) => {
      const next: GuideProgress = {
        contentVersion,
        chapterId: chapter.id,
        flowIndex,
        selectedNodeId,
        completedNodeIds,
        ...patch,
      };
      saveProgress(next);
    },
    [chapter.id, contentVersion, flowIndex, selectedNodeId, completedNodeIds],
  );

  useEffect(() => {
    if (!hydrated) return;
    persist({});
  }, [hydrated, flowIndex, selectedNodeId, completedNodeIds, persist]);

  const currentNodeId = flowOrder[flowIndex] ?? "";
  const isReviewing = selectedNodeId !== currentNodeId;

  const completedSet = useMemo(
    () => new Set(completedNodeIds),
    [completedNodeIds],
  );

  const goNext = useCallback(() => {
    const cur = flowOrder[flowIndex];
    if (!cur) return;
    const nextIndex = flowIndex + 1;
    const completed = new Set(completedNodeIds);
    completed.add(cur);
    if (nextIndex >= flowOrder.length) {
      setCompletedNodeIds([...completed]);
      return;
    }
    const nextId = flowOrder[nextIndex];
    setCompletedNodeIds([...completed]);
    setFlowIndex(nextIndex);
    setSelectedNodeId(nextId);
  }, [flowIndex, flowOrder, completedNodeIds]);

  /** 上一步：仅回退指针，默认不撤销 completed */
  const goPrev = useCallback(() => {
    if (flowIndex <= 0) return;
    const prevIndex = flowIndex - 1;
    setFlowIndex(prevIndex);
    setSelectedNodeId(flowOrder[prevIndex]);
  }, [flowIndex, flowOrder]);

  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const returnToCurrent = useCallback(() => {
    setSelectedNodeId(flowOrder[flowIndex] ?? "");
  }, [flowIndex, flowOrder]);

  /** 设为当前：指针对齐，且之前节点全部标为已完成 */
  const setAsCurrent = useCallback(
    (nodeId: string) => {
      const idx = flowOrder.indexOf(nodeId);
      if (idx < 0) return;
      const completed = new Set<string>();
      for (let i = 0; i < idx; i++) {
        const id = flowOrder[i];
        if (id) completed.add(id);
      }
      setFlowIndex(idx);
      setSelectedNodeId(nodeId);
      setCompletedNodeIds([...completed]);
    },
    [flowOrder],
  );

  const getNodeStatus = useCallback(
    (nodeId: string): "completed" | "current" | "upcoming" => {
      const idx = flowOrder.indexOf(nodeId);
      if (idx < 0) return "upcoming";
      if (completedSet.has(nodeId) || idx < flowIndex) return "completed";
      if (idx === flowIndex) return "current";
      return "upcoming";
    },
    [flowOrder, flowIndex, completedSet],
  );

  const flowLabel = useCallback(
    (nodeId: string) => {
      const idx = flowOrder.indexOf(nodeId);
      return idx >= 0 ? idx + 1 : 0;
    },
    [flowOrder],
  );

  return {
    hydrated,
    flowIndex,
    flowOrder,
    selectedNodeId,
    currentNodeId,
    isReviewing,
    completedSet,
    goNext,
    goPrev,
    selectNode,
    returnToCurrent,
    setAsCurrent,
    getNodeStatus,
    flowLabel,
    canGoPrev: flowIndex > 0,
    canGoNext: flowIndex < flowOrder.length - 1,
    isChapterEnd: flowIndex >= flowOrder.length - 1,
  };
}
