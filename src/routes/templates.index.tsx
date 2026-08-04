import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Database, Moon, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/site/reveal";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  landingTemplates,
  templateCategoryList,
  templateScores,
  buildTemplateProject,
} from "@/lib/templates/library";
import { upsertProject } from "@/lib/builder/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/templates/")({
  head: () => ({
    meta: [
      { title: "RetailX Templates — Production-Ready Site Starters" },
      {
        name: "description",
        content:
          "Duplicate responsive templates for SaaS, agency, ecommerce, portfolio and more — each scored for SEO, accessibility and performance.",
      },
      { property: "og:title", content: "RetailX Templates" },
      {
        property: "og:description",
        content: "Category templates with CMS wiring, dark mode and 100/100 performance targets.",
      },
      { name: "twitter:title", content: "RetailX Templates" },
      {
        name: "twitter:description",
        content: "Duplicate a scored, responsive template and publish in minutes.",
      },
    ],
  }),
  component: Templates,
});

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-muted-foreground flex items-center justify-between text-[0.7rem]">
        <span>{label}</span>
        <span className="text-foreground font-medium">{value}</span>
      </div>
      <div className="bg-secondary mt-1.5 h-1 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Templates() {
  const [active, setActive] = useState<string>("All");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return landingTemplates.filter(
      (t) =>
        (active === "All" || t.category === active) &&
        (!q ||
          `${t.name} ${t.category} ${t.blurb}`.toLowerCase().includes(q)),
    );
  }, [active, query]);

  const useTemplate = (slug: string) => {
    const template = landingTemplates.find((t) => t.slug === slug);
    if (!template) return;
    const project = buildTemplateProject(template);
    upsertProject(project);
    toast.success(`${template.name} duplicated into your workspace`);
    void navigate({ to: "/editor/$projectId", params: { projectId: project.id } });
  };

  return (
    <div className="px-6 pb-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="eyebrow">Template library</p>
          <h1 className="display-lg mt-4 max-w-3xl">
            Start from a template that already <span className="text-gradient">performs</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl leading-relaxed">
            Every template ships responsive across five breakpoints, dark mode ready, CMS wired, and
            audited for SEO, accessibility and Core Web Vitals before it reaches the library.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-10 flex flex-wrap gap-2">
          {templateCategoryList.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              aria-pressed={active === category}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-all duration-200 active:scale-95",
                active === category
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "glass text-muted-foreground hover:text-foreground",
              )}
            >
              {category}
            </button>
          ))}
        </Reveal>

        <Reveal delay={140} className="mt-6">
          <label className="sr-only" htmlFor="template-search">
            Search templates
          </label>
          <input
            id="template-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${landingTemplates.length} landing pages…`}
            className="glass w-full rounded-2xl px-5 py-3 text-sm outline-none sm:max-w-md"
          />
          <p className="text-muted-foreground mt-3 text-xs">
            Showing {visible.length} of {landingTemplates.length} templates
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((template, i) => (
            <Reveal key={template.slug} delay={i * 60}>
              <article className="glass hover:border-primary/40 group flex h-full flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1">
                <div
                  className="aurora relative h-40 overflow-hidden rounded-2xl"
                  aria-hidden="true"
                >
                  <div className="absolute inset-4 space-y-2">
                    <div className="bg-foreground/20 h-3 w-2/3 rounded-full" />
                    <div className="bg-foreground/10 h-2 w-1/2 rounded-full" />
                    <div className="bg-primary/70 mt-4 h-5 w-20 rounded-full" />
                    <div className="grid grid-cols-3 gap-2 pt-3">
                      <div className="bg-foreground/10 h-10 rounded-lg" />
                      <div className="bg-foreground/10 h-10 rounded-lg" />
                      <div className="bg-foreground/10 h-10 rounded-lg" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">
                    <Link
                      to="/templates/$slug"
                      params={{ slug: template.slug }}
                      className="hover:text-primary transition-colors"
                    >
                      {template.name}
                    </Link>
                  </h2>
                  <span className="text-xs font-medium" style={{ color: template.accent }}>
                    {template.category}
                  </span>
                </div>

                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {template.blurb}
                </p>

                <div className="text-muted-foreground mt-5 flex items-center gap-4 text-[0.7rem]">
                  <span className="inline-flex items-center gap-1">
                    <Smartphone className="size-3.5" /> Responsive
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Moon className="size-3.5" /> Dark mode
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Database className="size-3.5" /> CMS
                  </span>
                </div>

                <div className="mt-5 grid gap-2.5">
                  <Score label="SEO" value={templateScores(template).seo} />
                  <Score label="Accessibility" value={templateScores(template).a11y} />
                  <Score label="Performance" value={templateScores(template).perf} />
                </div>

                <div className="mt-6 flex-1" />
                <button
                  type="button"
                  onClick={() => useTemplate(template.slug)}
                  className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:brightness-110 active:scale-95"
                >
                  <Check className="size-4" /> Use this template
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
