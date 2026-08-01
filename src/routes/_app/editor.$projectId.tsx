import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Rocket,
  Download,
  Trash2,
  Copy,
  Plus,
  Layers,
  FileText,
  Palette,
  Search,
  Blocks as BlocksIcon,
  CheckCircle2,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { blockDefs, blockDefMap } from "@/lib/builder/blocks";
import { baseCss, buildStaticSite, mergeStyle, renderNode } from "@/lib/builder/render";
import { useProjectEditor } from "@/lib/builder/use-project-editor";
import { upsertProject } from "@/lib/builder/storage";
import { uid, type BlockType, type Breakpoint, type NodeStyle } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/editor/$projectId")({
  head: () => ({
    meta: [
      { title: "Visual editor — RetailX" },
      {
        name: "description",
        content: "Design pages on an infinite canvas with responsive breakpoints and instant publishing.",
      },
      { property: "og:title", content: "Visual editor — RetailX" },
      {
        property: "og:description",
        content: "Design pages on an infinite canvas with responsive breakpoints and instant publishing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorPage,
});

const frameWidth: Record<Breakpoint, number> = { base: 1180, tablet: 834, mobile: 390 };
const panels = [
  { id: "blocks", label: "Blocks", icon: BlocksIcon },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "seo", label: "SEO", icon: Search },
  { id: "deploy", label: "Deploy", icon: History },
] as const;

function EditorPage() {
  const { projectId } = Route.useParams();
  const e = useProjectEditor(projectId);
  const [panel, setPanel] = useState<(typeof panels)[number]["id"]>("blocks");
  const [query, setQuery] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (!e.project || !e.page) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm">
        <div className="text-center">
          <p className="text-muted-foreground">Project not found.</p>
          <Link to="/projects" className="text-primary mt-2 inline-block text-sm">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const { project, page, selected, breakpoint } = e;
  const style: NodeStyle = selected ? mergeStyle(selected, breakpoint) : {};

  const publish = () => {
    const { files, bytes } = buildStaticSite(project);
    const next = {
      ...structuredClone(project),
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deployments: [
        {
          id: uid(),
          at: new Date().toISOString(),
          pages: project.pages.length,
          bytes,
          status: "live" as const,
          note: `Published ${files.length} files`,
        },
        ...project.deployments.map((x) => ({ ...x, status: "rolled-back" as const })),
      ],
    };
    e.setProject(() => next);
    upsertProject(next);
    toast.success("Published to the edge", { description: `${files.length} files · ${(bytes / 1024).toFixed(1)} KB` });
  };


  const exportSite = () => {
    const { files } = buildStaticSite(project);
    files.forEach((f, i) => {
      setTimeout(() => {
        const blob = new Blob([f.content], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = f.path.replace(/\//g, "-");
        a.click();
        URL.revokeObjectURL(a.href);
      }, i * 120);
    });
    toast.success(`Exporting ${files.length} static files`);
  };

  const filtered = blockDefs.filter((b) => b.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100vh-57px)] md:-mx-8 md:-my-10">
      {/* Left panel */}
      <aside className="border-border bg-card/40 hidden w-72 shrink-0 flex-col border-r lg:flex">
        <div className="border-border flex items-center gap-1 border-b p-2">
          {panels.map((p) => (
            <button
              key={p.id}
              onClick={() => setPanel(p.id)}
              title={p.label}
              className={cn(
                "grid size-9 place-items-center rounded-xl transition",
                panel === p.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <p.icon className="size-4" />
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {panel === "blocks" && (
            <div className="space-y-3">
              <input
                value={query}
                onChange={(ev) => setQuery(ev.target.value)}
                placeholder="Search blocks"
                className="bg-secondary/50 w-full rounded-xl px-3 py-2 text-xs outline-none"
              />
              {["Marketing", "Content", "Media", "Layout", "Advanced"].map((group) => {
                const items = filtered.filter((b) => b.group === group);
                if (!items.length) return null;
                return (
                  <div key={group}>
                    <p className="text-muted-foreground mb-1.5 text-[11px] tracking-wide uppercase">{group}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((b) => (
                        <button
                          key={b.type}
                          draggable
                          onDragStart={(ev) => ev.dataTransfer.setData("text/block", b.type)}
                          onClick={() => e.addBlock(b.type)}
                          className="border-border hover:border-primary/60 hover:bg-secondary/50 rounded-xl border border-dashed p-2.5 text-left text-xs transition"
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {panel === "layers" && (
            <div className="space-y-1">
              {page.nodes.map((n, i) => (
                <div
                  key={n.id}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(ev) => ev.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== i) e.moveNode(dragIndex, i);
                    setDragIndex(null);
                  }}
                  onClick={() => e.setSelectedId(n.id)}
                  className={cn(
                    "flex cursor-grab items-center justify-between rounded-xl px-3 py-2 text-xs",
                    e.selectedId === n.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50",
                  )}
                >
                  <span className="truncate">{blockDefMap[n.type].label}</span>
                  <span className="flex shrink-0 gap-1">
                    <button onClick={(ev) => (ev.stopPropagation(), e.duplicateNode(n.id))} title="Duplicate">
                      <Copy className="size-3.5" />
                    </button>
                    <button onClick={(ev) => (ev.stopPropagation(), e.removeNode(n.id))} title="Delete">
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                </div>
              ))}
              {!page.nodes.length && <p className="text-muted-foreground text-xs">Canvas is empty — add a block.</p>}
            </div>
          )}

          {panel === "pages" && (
            <div className="space-y-2">
              {project.pages.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs",
                    p.id === e.pageId ? "bg-secondary" : "text-muted-foreground hover:bg-secondary/50",
                  )}
                >
                  <button onClick={() => e.setPageId(p.id)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate">{p.name}</span>
                    <span className="text-muted-foreground text-[11px]">{p.slug}</span>
                  </button>
                  {project.pages.length > 1 && (
                    <button
                      title="Delete page"
                      onClick={() => {
                        const remaining = project.pages.filter((x) => x.id !== p.id);
                        e.setProject((d) => {
                          d.pages = d.pages.filter((x) => x.id !== p.id);
                          return d;
                        });
                        if (p.id === e.pageId) e.setPageId(remaining[0]?.id ?? null);
                        toast.success(`Deleted “${p.name}”`);
                      }}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => {
                  const id = uid();
                  const n = project.pages.length + 1;
                  e.setProject((d) => {
                    d.pages.push({
                      id,
                      name: `Page ${n}`,
                      slug: `/page-${n}`,
                      seo: { title: `Page ${n}`, description: "" },
                      nodes: [],
                    });
                    return d;
                  });
                  e.setPageId(id);
                }}
                className="border-border text-muted-foreground hover:text-foreground flex w-full items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-xs"
              >
                <Plus className="size-3.5" /> New page
              </button>
            </div>
          )}

          {panel === "theme" && (
            <div className="space-y-3 text-xs">
              {(
                [
                  ["accent", "Accent"],
                  ["background", "Background"],
                  ["foreground", "Text"],
                  ["muted", "Muted text"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{label}</span>
                  <input
                    type="color"
                    value={project.theme[key]}
                    onChange={(ev) =>
                      e.setProject((d) => {
                        d.theme[key] = ev.target.value;
                        return d;
                      })
                    }
                    className="h-8 w-16 rounded-md bg-transparent"
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-muted-foreground">Radius {project.theme.radius}px</span>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={project.theme.radius}
                  onChange={(ev) =>
                    e.setProject((d) => {
                      d.theme.radius = Number(ev.target.value);
                      return d;
                    })
                  }
                  className="w-full"
                />
              </label>
            </div>
          )}

          {panel === "seo" && (
            <div className="space-y-3 text-xs">
              <Field
                label="Page name"
                value={page.name}
                onChange={(v) =>
                  e.setProject((d) => {
                    const p = d.pages.find((x) => x.id === page.id);
                    if (p) p.name = v;
                    return d;
                  })
                }
              />
              <Field
                label="Slug"
                value={page.slug}
                onChange={(v) =>
                  e.setProject((d) => {
                    const p = d.pages.find((x) => x.id === page.id);
                    if (p) p.slug = v.startsWith("/") ? v : `/${v}`;
                    return d;
                  })
                }
              />
              <Field
                label="Title tag"
                value={page.seo.title}
                onChange={(v) =>
                  e.setProject((d) => {
                    const p = d.pages.find((x) => x.id === page.id);
                    if (p) p.seo.title = v;
                    return d;
                  })
                }
              />
              <Field
                label="Meta description"
                textarea
                value={page.seo.description}
                onChange={(v) =>
                  e.setProject((d) => {
                    const p = d.pages.find((x) => x.id === page.id);
                    if (p) p.seo.description = v;
                    return d;
                  })
                }
              />
              <SeoScore title={page.seo.title} description={page.seo.description} nodes={page.nodes.length} />
            </div>
          )}

          {panel === "deploy" && (
            <div className="space-y-3 text-xs">
              <Field
                label="Domain"
                value={project.domain}
                onChange={(v) =>
                  e.setProject((d) => {
                    d.domain = v;
                    return d;
                  })
                }
              />
              <button
                onClick={publish}
                className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-full py-2 font-semibold"
              >
                <Rocket className="size-3.5" /> Publish
              </button>
              <button
                onClick={exportSite}
                className="border-border text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-2 rounded-full border py-2"
              >
                <Download className="size-3.5" /> Export static build
              </button>
              <div className="space-y-2 pt-2">
                <p className="text-muted-foreground text-[11px] uppercase">Deployment history</p>
                {project.deployments.map((d) => (
                  <div key={d.id} className="border-border rounded-xl border p-2.5">
                    <div className="flex items-center justify-between">
                      <span className={d.status === "live" ? "text-primary" : "text-muted-foreground"}>
                        {d.status}
                      </span>
                      <span className="text-muted-foreground">{(d.bytes / 1024).toFixed(1)} KB</span>
                    </div>
                    <p className="text-muted-foreground mt-1">{new Date(d.at).toLocaleString()}</p>
                    {d.status !== "live" && (
                      <button
                        onClick={() =>
                          e.setProject((draft) => {
                            draft.deployments = draft.deployments.map((x) => ({
                              ...x,
                              status: x.id === d.id ? ("live" as const) : ("rolled-back" as const),
                            }));
                            return draft;
                          })
                        }
                        className="text-primary mt-1"
                      >
                        Roll back to this
                      </button>
                    )}
                  </div>
                ))}
                {!project.deployments.length && <p className="text-muted-foreground">No deployments yet.</p>}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Canvas */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-border flex flex-wrap items-center gap-2 border-b px-3 py-2">
          <Link to="/projects" className="text-muted-foreground hover:text-foreground text-xs">
            ← Projects
          </Link>
          <span className="font-display truncate text-sm font-semibold">{project.name}</span>
          <div className="ml-2 flex items-center gap-1">
            <IconBtn onClick={e.undo} disabled={!e.canUndo} title="Undo (⌘Z)">
              <Undo2 className="size-4" />
            </IconBtn>
            <IconBtn onClick={e.redo} disabled={!e.canRedo} title="Redo (⇧⌘Z)">
              <Redo2 className="size-4" />
            </IconBtn>

          </div>
          <div className="bg-secondary/50 ml-auto flex items-center gap-1 rounded-full p-1">
            {(
              [
                ["base", Monitor],
                ["tablet", Tablet],
                ["mobile", Smartphone],
              ] as const
            ).map(([bp, Icon]) => (
              <button
                key={bp}
                onClick={() => e.setBreakpoint(bp)}
                title={bp}
                className={cn(
                  "grid size-7 place-items-center rounded-full",
                  breakpoint === bp ? "bg-background text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
              </button>
            ))}
          </div>
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <CheckCircle2 className={cn("size-3.5", e.saved ? "text-primary" : "opacity-40")} />
            {e.saved ? "Saved" : "Saving…"}
          </span>
          <Link
            to="/preview/$projectId"
            params={{ projectId }}
            className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
          >
            <Eye className="size-3.5" /> Preview
          </Link>
          <button
            onClick={publish}
            className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold"
          >
            <Rocket className="size-3.5" /> Publish
          </button>
        </div>

        <div
          className="bg-background/60 min-h-0 flex-1 overflow-auto p-6"
          onDragOver={(ev) => ev.preventDefault()}
          onDrop={(ev) => {
            const type = ev.dataTransfer.getData("text/block") as BlockType;
            if (type) e.addBlock(type);
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: baseCss(project.theme).replace(/^body\{[^}]*\}/m, "") }} />
          <div
            className="mx-auto shadow-[var(--shadow-lift)] transition-[width] duration-300"
            style={{
              width: frameWidth[breakpoint],
              maxWidth: "100%",
              background: project.theme.background,
              color: project.theme.foreground,
              fontFamily: project.theme.font,
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            {page.nodes.map((n, i) => (
              <div
                key={n.id}
                onClick={(ev) => {
                  // Links inside rendered blocks must not navigate while editing.
                  if ((ev.target as HTMLElement).closest("a,button,summary,input,textarea")) ev.preventDefault();
                  e.setSelectedId(n.id);
                }}

                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  const type = ev.dataTransfer.getData("text/block") as BlockType;
                  if (type) {
                    ev.stopPropagation();
                    e.addBlock(type, i + 1);
                  } else if (dragIndex !== null && dragIndex !== i) {
                    e.moveNode(dragIndex, i);
                  }
                  setDragIndex(null);
                }}
                className={cn(
                  "relative cursor-pointer outline-offset-[-2px]",
                  e.selectedId === n.id ? "outline outline-2 outline-[color:var(--color-primary)]" : "hover:outline hover:outline-1 hover:outline-white/25",
                )}
                dangerouslySetInnerHTML={{ __html: renderNode(n, project.theme, breakpoint) }}
              />
            ))}
            {!page.nodes.length && (
              <div className="text-muted-foreground grid h-80 place-items-center text-sm">
                Drag a block here to start designing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inspector */}
      <aside className="border-border bg-card/40 hidden w-72 shrink-0 overflow-y-auto border-l p-3 xl:block">
        {!selected && <p className="text-muted-foreground text-xs">Select a block to edit its content and style.</p>}
        {selected && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold">{blockDefMap[selected.type].label}</span>
              <span className="text-muted-foreground text-[11px]">{breakpoint}</span>
            </div>

            {blockDefMap[selected.type].fields.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                textarea={f.type === "textarea" || f.type === "list"}
                value={
                  f.type === "list"
                    ? (Array.isArray(selected.props[f.key])
                        ? (selected.props[f.key] as unknown[]).map(String)
                        : String(selected.props[f.key] ?? "")
                            .split("\n")
                            .filter(Boolean)
                      ).join("\n")
                    : String(selected.props[f.key] ?? "")
                }

                onChange={(v) => e.setNodeProp(selected.id, f.key, f.type === "list" ? v.split("\n") : v)}
              />
            ))}

            <div className="border-border space-y-3 border-t pt-3">
              <Range label="Padding Y" value={style.paddingY ?? 40} max={200} onChange={(v) => e.setNodeStyle(selected.id, { paddingY: v })} />
              <Range label="Padding X" value={style.paddingX ?? 24} max={120} onChange={(v) => e.setNodeStyle(selected.id, { paddingX: v })} />
              <Range label="Max width" value={style.maxWidth ?? 1100} max={1600} step={20} onChange={(v) => e.setNodeStyle(selected.id, { maxWidth: v })} />
              {"columns" in (blockDefMap[selected.type].defaultStyle ?? {}) && (
                <Range label="Columns" value={style.columns ?? 3} max={6} min={1} onChange={(v) => e.setNodeStyle(selected.id, { columns: v })} />
              )}
              <div>
                <span className="text-muted-foreground">Align</span>
                <div className="mt-1 flex gap-1">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => e.setNodeStyle(selected.id, { align: a })}
                      className={cn(
                        "flex-1 rounded-lg py-1.5 capitalize",
                        style.align === a ? "bg-secondary" : "text-muted-foreground hover:bg-secondary/50",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between">
                <span className="text-muted-foreground">Background</span>
                <input
                  type="color"
                  value={style.background ?? project.theme.background}
                  onChange={(ev) => e.setNodeStyle(selected.id, { background: ev.target.value })}
                  className="h-7 w-14 bg-transparent"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-muted-foreground">Animation</span>
                <select
                  value={style.animation ?? "none"}
                  onChange={(ev) => e.setNodeStyle(selected.id, { animation: ev.target.value as NodeStyle["animation"] })}
                  className="bg-secondary/60 rounded-lg px-2 py-1"
                >
                  {["none", "fade-up", "fade-in", "zoom-in"].map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-muted-foreground">Hide on {breakpoint}</span>
                <input
                  type="checkbox"
                  checked={!!style.hidden}
                  onChange={(ev) => e.setNodeStyle(selected.id, { hidden: ev.target.checked })}
                />
              </label>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => e.duplicateNode(selected.id)}
                className="border-border flex-1 rounded-full border py-1.5"
              >
                Duplicate
              </button>
              <button
                onClick={() => e.removeNode(selected.id)}
                className="border-border text-destructive flex-1 rounded-full border py-1.5"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function IconBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="text-muted-foreground hover:text-foreground hover:bg-secondary/60 grid size-7 place-items-center rounded-lg"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const cls = "bg-secondary/50 mt-1 w-full rounded-xl px-3 py-2 text-xs outline-none";
  return (
    <label className="block">
      <span className="text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

function Range({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-muted-foreground">
        {label} <span className="text-foreground">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}

function SeoScore({ title, description, nodes }: { title: string; description: string; nodes: number }) {
  let score = 0;
  if (title.length >= 15 && title.length <= 60) score += 40;
  else if (title) score += 20;
  if (description.length >= 50 && description.length <= 160) score += 40;
  else if (description) score += 20;
  if (nodes > 2) score += 20;
  return (
    <div className="border-border rounded-xl border p-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">SEO score</span>
        <span className={score >= 80 ? "text-primary" : "text-foreground"}>{score}/100</span>
      </div>
      <div className="bg-secondary mt-2 h-1.5 overflow-hidden rounded-full">
        <div className="bg-primary h-full transition-all" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
