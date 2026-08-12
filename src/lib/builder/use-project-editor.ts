import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createNode } from "./blocks";
import {
  getProject,
  publishProject,
  rollbackDeployment,
  saveProject,
} from "@/lib/api.functions";
import {
  uid,
  type BlockType,
  type Breakpoint,
  type BuilderNode,
  type BuilderProject,
  type Deployment,
  type NodeStyle,
} from "./types";

type ServerDeployment = {
  id: string;
  status: string;
  environment: string;
  url: string | null;
  log: string | null;
  created_at: string;
};

function mapDeployments(rows: ServerDeployment[], pageCount: number): Deployment[] {
  return rows.map((row, index) => {
    const kb = /\(([\d.]+) kB\)/.exec(row.log ?? "")?.[1];
    return {
      id: row.id,
      at: row.created_at,
      pages: pageCount,
      bytes: kb ? Math.round(Number(kb) * 1024) : 0,
      status: index === 0 && row.status === "success" ? "live" : "rolled-back",
      note: (row.log ?? "").split("\n").pop() ?? row.environment,
    };
  });
}

export function useProjectEditor(projectId: string) {
  const fetchProject = useServerFn(getProject);
  const persist = useServerFn(saveProject);
  const deploy = useServerFn(publishProject);
  const rollbackFn = useServerFn(rollbackDeployment);

  const [project, setProject] = useState<BuilderProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("base");
  const [saved, setSaved] = useState(true);
  const [past, setPast] = useState<BuilderProject[]>([]);
  const [future, setFuture] = useState<BuilderProject[]>([]);
  const dirtyRef = useRef(false);

  const load = useCallback(async () => {
    const res = await fetchProject({ data: { projectId } });
    const p = res.project as unknown as {
      id: string;
      name: string;
      domain: string;
      theme: BuilderProject["theme"];
      pages: BuilderProject["pages"];
      updatedAt: string;
      publishedAt: string | null;
    };
    const next: BuilderProject = {
      id: p.id,
      name: p.name,
      domain: p.domain,
      theme: p.theme,
      pages: p.pages ?? [],
      deployments: mapDeployments(
        (res.deployments ?? []) as unknown as ServerDeployment[],
        (p.pages ?? []).length,
      ),
      updatedAt: p.updatedAt,
      publishedAt: p.publishedAt,
    };
    setRole(res.role as string);
    return next;
  }, [fetchProject, projectId]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setProject(null);
    setPast([]);
    setFuture([]);
    setSelectedId(null);
    setSaved(true);
    dirtyRef.current = false;
    load()
      .then((next) => {
        if (!alive) return;
        setProject(next);
        setPageId(next.pages[0]?.id ?? null);
      })
      .catch(() => alive && setProject(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

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
      if (!project) return;
      const next = { ...updater(structuredClone(project)), updatedAt: new Date().toISOString() };
      if (opts?.history !== false) {
        setPast((p) => [...p.slice(-49), project]);
        setFuture([]);
      }
      setProject(next);
      dirtyRef.current = true;
      setSaved(false);
    },
    [project],
  );

  // Autosave to the platform database.
  useEffect(() => {
    if (!project || saved) return;
    const t = setTimeout(() => {
      persist({
        data: {
          projectId: project.id,
          name: project.name,
          pages: project.pages,
          theme: project.theme,
        },
      })
        .then(() => {
          dirtyRef.current = false;
          setSaved(true);
        })
        .catch(() => setSaved(false));
    }, 700);
    return () => clearTimeout(t);
  }, [project, saved, persist]);

  const flush = useCallback(async () => {
    if (!project || !dirtyRef.current) return;
    await persist({
      data: {
        projectId: project.id,
        name: project.name,
        pages: project.pages,
        theme: project.theme,
      },
    });
    dirtyRef.current = false;
    setSaved(true);
  }, [project, persist]);

  const publish = useCallback(
    async (environment: "production" | "preview" = "production") => {
      if (!project) return null;
      await flush();
      const res = await deploy({ data: { projectId: project.id, environment } });
      const refreshed = await load();
      setProject(refreshed);
      return res as { url?: string | null };
    },
    [project, flush, deploy, load],
  );

  const rollback = useCallback(
    async (deploymentId: string) => {
      await rollbackFn({ data: { deploymentId } });
      const refreshed = await load();
      setProject(refreshed);
      setSelectedId(null);
    },
    [rollbackFn, load],
  );

  const updatePage = useCallback(
    (fn: (p: NonNullable<typeof page>) => void, history = true) =>
      commit(
        (draft) => {
          const target = draft.pages.find((p) => p.id === (pageId ?? draft.pages[0]?.id));
          if (target) fn(target);
          return draft;
        },
        { history },
      ),
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
    const prev = past[past.length - 1];
    if (!prev || !project) return;
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [...f, project]);
    setProject(prev);
    dirtyRef.current = true;
    setSaved(false);
  }, [past, project]);

  const redo = useCallback(() => {
    const next = future[future.length - 1];
    if (!next || !project) return;
    setFuture((f) => f.slice(0, -1));
    setPast((p) => [...p, project]);
    setProject(next);
    dirtyRef.current = true;
    setSaved(false);
  }, [future, project]);

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
    loading,
    role,
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
    publish,
    rollback,
    flush,
    addBlock,
    moveNode,
    removeNode,
    duplicateNode,
    setNodeProp,
    setNodeStyle,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
