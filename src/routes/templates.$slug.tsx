import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Database, Moon, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/reveal";
import { upsertProject } from "@/lib/builder/storage";
import {
  buildTemplateProject,
  templateBySlug,
  templateNodes,
  templateScores,
} from "@/lib/templates/library";

const SITE_ORIGIN = "https://build-sparkle-site-25.lovable.app";

export const Route = createFileRoute("/templates/$slug")({
  loader: ({ params }) => {
    const template = templateBySlug(params.slug);
    if (!template) throw notFound();
    return { slug: template.slug };
  },
  head: ({ loaderData }) => {
    const template = loaderData ? templateBySlug(loaderData.slug) : undefined;
    if (!template) {
      return {
        meta: [{ title: "Template not found — RetailX" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${template.name} — ${template.category} template | RetailX`;
    const url = `${SITE_ORIGIN}/templates/${template.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: template.blurb },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: template.blurb },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: template.blurb },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: template.name,
            description: template.blurb,
            genre: template.category,
            url,
            isAccessibleForFree: true,
            provider: { "@type": "Organization", name: "RetailX" },
          }),
        },
      ],
    };
  },
  notFoundComponent: TemplateMissing,
  component: TemplateDetail,
});

function TemplateMissing() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="display-lg">Template not found</h1>
      <p className="text-muted-foreground mt-4">
        That template may have been renamed. Browse the full library instead.
      </p>
      <Link
        to="/templates"
        className="bg-primary text-primary-foreground mt-8 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
      >
        All templates
      </Link>
    </div>
  );
}

function TemplateDetail() {
  const { slug } = Route.useLoaderData();
  const navigate = useNavigate();
  const template = templateBySlug(slug);
  if (!template) throw notFound();

  const scores = templateScores(template);
  const sections = templateNodes(template).map((n) => n.type);

  const use = () => {
    const project = buildTemplateProject(template);
    upsertProject(project);
    toast.success(`${template.name} duplicated into your workspace`);
    void navigate({ to: "/editor/$projectId", params: { projectId: project.id } });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-32">
      <Link
        to="/templates"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" /> All templates
      </Link>

      <Reveal className="mt-8">
        <p className="eyebrow" style={{ color: template.accent }}>
          {template.category}
        </p>
        <h1 className="display-lg mt-4">{template.name}</h1>
        <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed">{template.blurb}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={use}
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:brightness-110 active:scale-95"
          >
            <Check className="size-4" /> Use this template
          </button>
          <span className="glass text-muted-foreground inline-flex items-center gap-4 rounded-full px-4 py-2.5 text-xs">
            <span className="inline-flex items-center gap-1">
              <Smartphone className="size-3.5" /> Responsive
            </span>
            <span className="inline-flex items-center gap-1">
              <Moon className="size-3.5" /> Dark mode
            </span>
            <span className="inline-flex items-center gap-1">
              <Database className="size-3.5" /> CMS
            </span>
          </span>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        <Reveal className="glass rounded-3xl p-6">
          <h2 className="font-display text-base font-semibold">Audit scores</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["SEO", scores.seo],
              ["Accessibility", scores.a11y],
              ["Performance", scores.perf],
            ].map(([label, value]) => (
              <div key={label as string} className="flex items-center justify-between">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={80} className="glass rounded-3xl p-6">
          <h2 className="font-display text-base font-semibold">Included sections</h2>
          <ul className="text-muted-foreground mt-4 flex flex-wrap gap-2 text-xs">
            {sections.map((s, i) => (
              <li key={`${s}-${i}`} className="bg-secondary/60 rounded-full px-3 py-1 capitalize">
                {s}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={160} className="glass rounded-3xl p-6">
          <h2 className="font-display text-base font-semibold">Highlights</h2>
          <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
            {template.features.slice(0, 4).map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="text-primary mt-0.5 size-4 shrink-0" />
                <span>{f.split("|")[0]?.trim()}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
