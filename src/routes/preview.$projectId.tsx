import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadProjects } from "@/lib/builder/storage";
import { renderPageDocument } from "@/lib/builder/render";
import type { BuilderProject } from "@/lib/builder/types";

export const Route = createFileRoute("/preview/$projectId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Site preview — RetailX" },
      { name: "description", content: "Live preview of a RetailX static site build." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { projectId } = Route.useParams();
  const [project, setProject] = useState<BuilderProject | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setProject(loadProjects().find((p) => p.id === projectId) ?? null);
  }, [projectId]);

  if (!project) {
    return <div className="grid min-h-screen place-items-center text-sm">Loading preview…</div>;
  }

  const page = project.pages[pageIndex] ?? project.pages[0];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="glass flex flex-wrap items-center gap-3 rounded-none border-x-0 border-t-0 px-4 py-2.5">
        <Link
          to="/editor/$projectId"
          params={{ projectId }}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="size-3.5" /> Back to editor
        </Link>
        <span className="text-muted-foreground text-xs">{project.domain}</span>
        <div className="ml-auto flex gap-1">
          {project.pages.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPageIndex(i)}
              className={`rounded-full px-3 py-1 text-xs ${i === pageIndex ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <iframe
        title={`${project.name} preview`}
        className="w-full flex-1 border-0"
        style={{ minHeight: "calc(100vh - 44px)" }}
        srcDoc={renderPageDocument(project, page)}
      />
    </div>
  );
}
