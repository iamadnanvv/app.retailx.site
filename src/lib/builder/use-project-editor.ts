import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createNode } from "./blocks";
import { loadProjects, upsertProject } from "./storage";
import { uid, type BlockType, type Breakpoint, type BuilderNode, type BuilderProject, type NodeStyle } from "./types";

export function useProjectEditor(projectId: string) {
  const [project, setProject] = useState<BuilderProject | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("base");
  const [saved, setSaved] = useState(true);
  const past = useRef<BuilderProject[]>([]);
  const future = useRef<BuilderProject[]>([]);
  const [, force] = useState(0);

  useEffect(() => {
    const found = loadProjects().find((p) => p.id === projectId) ?? null;
    setProject(found);
    setPageId(found?.pages[0]?.id ?? null);
  }, [projectId]);

  const page = useMemo(
    () => project?.pages.find((p) => p.id === pageId) ?? project?.pages[0] ?? null,
    [project, pageId],
  );
  const selected = useMemo(
    () => page?.nodes.find((n) => n.id === selectedId) ?? null,
    [page, selectedId],
  );

  const commit = useCallback(
    (updater: (draft: BuilderProject) => BuilderProject, opts?: { history?: boolean }) => {
      setProject((current) => {
        if (!current) return current;
        if (opts?.history !== false) {
          past.current = [...past.current.slice(-49), structuredClone(current)];
          future.current = [];
        }
        const next = { ...updater(structuredClone(current)), updatedAt: new Date().toISOString() };
        setSaved(false);
        return next;
      });
      force((n) => n + 1);
    },
    [],
  );

  // Autosave
  useEffect(() => {
    if (!project || saved) return;
    const t = setTimeout(() => {
      upsertProject(project);
      setSaved(true);
    }, 600);
    return () => clearTimeout(t);
  }, [project, saved]);

  const updatePage = useCallback(
    (fn: (p: NonNullable<typeof page>) => void, history = true) =>
      commit((draft) => {
        const target = draft.pages.find((p) => p.id === (pageId ?? draft.pages[0]?.id));
        if (target) fn(target);
        return draft;
      }, { history }),
    [commit, pageId],
  );

  const addBlock = useCallback(
    (type: BlockType, index?: number) => {
      const node = createNode(type);
      updatePage((p) => {
        const at = index ?? p.nodes.length;
        p.nodes.splice(at, 0, node);
      });
      setSelectedId(node.id);
    },
    [updatePage],
  );

  const moveNode = useCallback(
    (from: number, to: number) =>
      updatePage((p) => {
        const [n] = p.nodes.splice(from, 1);
        if (n) p.nodes.splice(to, 0, n);
      }),
    [updatePage],
  );

  const removeNode = useCallback(
    (id: string) => {
      updatePage((p) => {
        p.nodes = p.nodes.filter((n) => n.id !== id);
      });
      setSelectedId((s) => (s === id ? null : s));
    },
    [updatePage],
  );

  const duplicateNode = useCallback(
    (id: string) =>
      updatePage((p) => {
        const i = p.nodes.findIndex((n) => n.id === id);
        if (i < 0) return;
        const copy: BuilderNode = { ...structuredClone(p.nodes[i]), id: uid() };
        p.nodes.splice(i + 1, 0, copy);
      }),
    [updatePage],
  );

  const setNodeProp = useCallback(
    (id: string, key: string, value: unknown) =>
      updatePage((p) => {
        const n = p.nodes.find((x) => x.id === id);
        if (n) n.props[key] = value;
      }),
    [updatePage],
  );

  const setNodeStyle = useCallback(
    (id: string, patch: Partial<NodeStyle>) =>
      updatePage((p) => {
        const n = p.nodes.find((x) => x.id === id);
        if (!n) return;
        n.styles[breakpoint] = { ...(n.styles[breakpoint] ?? {}), ...patch };
      }),
    [updatePage, breakpoint],
  );

  const undo = useCallback(() => {
    setProject((current) => {
      const prev = past.current.pop();
      if (!current || !prev) return current;
      future.current = [...future.current, structuredClone(current)];
      setSaved(false);
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setProject((current) => {
      const next = future.current.pop();
      if (!current || !next) return current;
      past.current = [...past.current, structuredClone(current)];
      setSaved(false);
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (mod && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault();
        duplicateNode(selectedId);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeNode(selectedId);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, duplicateNode, removeNode, selectedId]);

  return {
    project,
    setProject: commit,
    page,
    pageId: page?.id ?? null,
    setPageId,
    selected,
    selectedId,
    setSelectedId,
    breakpoint,
    setBreakpoint,
    saved,
    addBlock,
    moveNode,
    removeNode,
    duplicateNode,
    setNodeProp,
    setNodeStyle,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
