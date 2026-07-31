import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Plus, Copy, Trash2, ExternalLink, Globe, PencilRuler } from "lucide-react";
import { toast } from "sonner";
import {
  createProject,
  deleteProject,
  duplicateProject,
  loadProjects,
  upsertProject,
} from "@/lib/builder/storage";
import type { BuilderProject } from "@/lib/builder/types";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({
    meta: [
      { title: "Projects — RetailX" },
      {
        name: "description",
        content: "Create, duplicate and publish your RetailX static sites from one workspace.",
      },
      { property: "og:title", content: "Projects — RetailX" },
      {
        property: "og:description",
        content: "Create, duplicate and publish your RetailX static sites from one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [name, setName] = useState("");

  const refresh = useCallback(() => setProjects(loadProjects()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("retailx:projects", refresh);
    return () => window.removeEventListener("retailx:projects", refresh);
  }, [refresh]);

  const create = () => {
    const label = name.trim() || "Untitled site";
    const project = createProject(label, label);
    upsertProject(project);
    setName("");
    refresh();
    toast.success(`${label} created`);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display truncate text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every project is a static site: pages, design tokens, SEO and deployments.
          </p>
        </div>
      </header>

      <div className="glass mt-6 flex flex-wrap items-center gap-3 rounded-3xl p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="New site name"
          className="bg-secondary/50 min-w-0 flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
        />
        <button
          onClick={create}
          className="bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:brightness-110"
        >
          <Plus className="size-4" /> Create site
        </button>
      </div>

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
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] ${
                  p.publishedAt ? "bg-primary/15 text-primary" : "bg-secondary/70 text-muted-foreground"
                }`}
              >
                {p.publishedAt ? "Live" : "Draft"}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {p.pages.length} page{p.pages.length === 1 ? "" : "s"} ·{" "}
              {p.deployments.length} deployment{p.deployments.length === 1 ? "" : "s"} · updated{" "}
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
              <Link
                to="/preview/$projectId"
                params={{ projectId: p.id }}
                className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs"
              >
                <ExternalLink className="size-3.5" /> Preview
              </Link>
              <button
                onClick={() => {
                  duplicateProject(p.id);
                  refresh();
                  toast.success("Project duplicated");
                }}
                className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs"
              >
                <Copy className="size-3.5" /> Duplicate
              </button>
              <button
                onClick={() => {
                  deleteProject(p.id);
                  refresh();
                  toast("Project deleted");
                }}
                className="text-muted-foreground hover:text-destructive inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
