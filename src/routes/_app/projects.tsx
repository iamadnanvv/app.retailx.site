import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Copy, Trash2, ExternalLink, Globe, PencilRuler, Star, Rocket } from "lucide-react";
import { toast } from "sonner";
import {
  createProject,
  deleteProject,
  duplicateProject,
  listProjects,
  publishProject,
  toggleFavorite,
} from "@/lib/api.functions";
import { useWorkspace } from "@/lib/use-workspace";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({
    meta: [
      { title: "Projects — RetailX" },
      {
        name: "description",
        content: "Create, duplicate and publish your RetailX static sites from one workspace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { workspaceId, isLoading: wsLoading } = useWorkspace();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const list = useServerFn(listProjects);
  const create = useServerFn(createProject);
  const dupe = useServerFn(duplicateProject);
  const remove = useServerFn(deleteProject);
  const fav = useServerFn(toggleFavorite);
  const publish = useServerFn(publishProject);

  const projectsQuery = useQuery({
    queryKey: ["projects", workspaceId],
    enabled: Boolean(workspaceId),
    queryFn: () => list({ data: { workspaceId: workspaceId! } }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const createMutation = useMutation({
    mutationFn: (label: string) => create({ data: { workspaceId: workspaceId!, name: label } }),
    onSuccess: (_res, label) => {
      setName("");
      invalidate();
      toast.success(`${label} created`);
    },
    onError: (e: Error) => toast.error(e.message || "Could not create the site"),
  });

  const dupeMutation = useMutation({
    mutationFn: (projectId: string) => dupe({ data: { projectId } }),
    onSuccess: () => {
      invalidate();
      toast.success("Project duplicated");
    },
    onError: (e: Error) => toast.error(e.message || "Could not duplicate"),
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => remove({ data: { projectId } }),
    onSuccess: () => {
      invalidate();
      toast("Project deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Could not delete"),
  });

  const favMutation = useMutation({
    mutationFn: (projectId: string) => fav({ data: { projectId } }),
    onSuccess: () => invalidate(),
  });

  const publishMutation = useMutation({
    mutationFn: (projectId: string) => publish({ data: { projectId, environment: "production" } }),
    onSuccess: (res) => {
      invalidate();
      const url = (res as { url?: string | null })?.url;
      toast.success("Published to the edge", { description: url ?? undefined });
    },
    onError: (e: Error) => toast.error(e.message || "Publish failed"),
  });

  const projects = projectsQuery.data ?? [];
  const busy = wsLoading || projectsQuery.isPending;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display truncate text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every project is a static site: pages, design tokens, SEO and deployments — stored in
            your workspace.
          </p>
        </div>
      </header>

      <div className="glass mt-6 flex flex-wrap items-center gap-3 rounded-3xl p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && workspaceId && createMutation.mutate(name.trim() || "Untitled site")}
          placeholder="New site name"
          className="bg-secondary/50 min-w-0 flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
        />
        <button
          disabled={!workspaceId || createMutation.isPending}
          onClick={() => createMutation.mutate(name.trim() || "Untitled site")}
          className="bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:brightness-110 disabled:opacity-50"
        >
          <Plus className="size-4" /> {createMutation.isPending ? "Creating…" : "Create site"}
        </button>
      </div>

      {busy ? (
        <div className="glass mt-6 grid h-40 place-items-center rounded-3xl">
          <div className="border-primary/30 border-t-primary size-6 animate-spin rounded-full border-2" />
        </div>
      ) : projects.length === 0 ? (
        <p className="text-muted-foreground mt-6 text-sm">
          No sites yet — name one above, or start from a{" "}
          <Link to="/templates" className="text-primary">
            template
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <div key={p.id} className="glass flex flex-col gap-3 rounded-3xl p-5">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display truncate text-lg font-semibold">{p.name}</h2>
                  <p className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
                    <Globe className="size-3 shrink-0" /> {p.domain}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => favMutation.mutate(p.id)}
                    aria-label="Toggle favourite"
                    className={p.favorite ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                  >
                    <Star className={`size-4 ${p.favorite ? "fill-current" : ""}`} />
                  </button>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] ${
                      p.publishedAt
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary/70 text-muted-foreground"
                    }`}
                  >
                    {p.publishedAt ? "Live" : "Draft"}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                {p.pageCount} page{p.pageCount === 1 ? "" : "s"} · updated{" "}
                {new Date(p.updatedAt).toLocaleDateString()}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <Link
                  to="/editor/$projectId"
                  params={{ projectId: p.id }}
                  className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                >
                  <PencilRuler className="size-3.5" /> Open editor
                </Link>
                <button
                  onClick={() => publishMutation.mutate(p.id)}
                  disabled={publishMutation.isPending}
                  className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs disabled:opacity-50"
                >
                  <Rocket className="size-3.5" /> Publish
                </button>
                {p.publishedAt && (
                  <a
                    href={`/s/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs"
                  >
                    <ExternalLink className="size-3.5" /> Live site
                  </a>
                )}
                <Link
                  to="/preview/$projectId"
                  params={{ projectId: p.id }}
                  className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs"
                >
                  <ExternalLink className="size-3.5" /> Preview
                </Link>
                <button
                  onClick={() => dupeMutation.mutate(p.id)}
                  className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs"
                >
                  <Copy className="size-3.5" /> Duplicate
                </button>
                <button
                  onClick={() => deleteMutation.mutate(p.id)}
                  aria-label="Delete project"
                  className="text-muted-foreground hover:text-destructive inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
