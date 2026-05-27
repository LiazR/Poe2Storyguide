import { useCallback, useEffect, useMemo, useState } from "react";
import type { Chapter } from "@/types/content";

const STORAGE_KEY = "poe2storyguide_progress";

export interface ChapterProgressEntry {
  flowIndex: number;
  flowTotal: number;
  selectedNodeId: string;
  completedNodeIds: string[];
}

interface ProgressStore {
  contentVersion: string;
  lastChapterId?: string;
  chapters: Record<string, ChapterProgressEntry>;
}

interface LegacyProgress {
  contentVersion: string;
  chapterId: string;
  flowIndex: number;
  selectedNodeId: string;
  completedNodeIds: string[];
}

function emptyStore(version: string): ProgressStore {
  return { contentVersion: version, chapters: {} };
}

function isLegacy(value: unknown): value is LegacyProgress {
  return (
    !!value &&
    typeof value === "object" &&
    "chapterId" in (value as Record<string, unknown>) &&
    typeof (value as LegacyProgress).chapterId === "string"
  );
}

function readStoreRaw(): ProgressStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isLegacy(parsed)) {
      const migrated: ProgressStore = {
        contentVersion: parsed.contentVersion,
        lastChapterId: parsed.chapterId,
        chapters: {
          [parsed.chapterId]: {
            flowIndex: parsed.flowIndex,
            flowTotal: 0,
            selectedNodeId: parsed.selectedNodeId,
            completedNodeIds: parsed.completedNodeIds ?? [],
          },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as ProgressStore).contentVersion === "string" &&
      (parsed as ProgressStore).chapters &&
      typeof (parsed as ProgressStore).chapters === "object"
    ) {
      return parsed as ProgressStore;
    }
    return null;
  } catch {
    return null;
  }
}

function readStoreForVersion(version: string): ProgressStore {
  const stored = readStoreRaw();
  if (!stored) return emptyStore(version);
  if (stored.contentVersion !== version) return emptyStore(version);
  return stored;
}

export function readChapterProgress(
  chapterId: string,
  version: string,
): ChapterProgressEntry | null {
  const store = readStoreForVersion(version);
  return store.chapters[chapterId] ?? null;
}

export function readLastChapterId(version: string): string | null {
  const store = readStoreForVersion(version);
  return store.lastChapterId ?? null;
}

export function readAllChapterProgress(
  version: string,
): Record<string, ChapterProgressEntry> {
  return readStoreForVersion(version).chapters;
}

export function clearAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

function writeChapterProgress(
  version: string,
  chapterId: string,
  entry: ChapterProgressEntry,
) {
  const store = readStoreForVersion(version);
  store.contentVersion = version;
  store.chapters[chapterId] = entry;
  store.lastChapterId = chapterId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function useGuideProgress(chapter: Chapter, contentVersion: string) {
  const { flowOrder } = chapter;

  const [flowIndex, setFlowIndex] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState(flowOrder[0] ?? "");
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readChapterProgress(chapter.id, contentVersion);
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
    (patch: Partial<ChapterProgressEntry>) => {
      const next: ChapterProgressEntry = {
        flowIndex,
        flowTotal: flowOrder.length,
        selectedNodeId,
        completedNodeIds,
        ...patch,
      };
      writeChapterProgress(contentVersion, chapter.id, next);
    },
    [
      chapter.id,
      contentVersion,
      flowIndex,
      selectedNodeId,
      completedNodeIds,
      flowOrder.length,
    ],
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
