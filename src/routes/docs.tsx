import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/reveal";
import { MagneticButton } from "@/components/site/magnetic-button";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "RetailX Docs — Builder, CMS, Publishing and Extension API" },
      {
        name: "description",
        content:
          "Learn the RetailX canvas, design tokens, CMS collections, interaction builder, publishing pipeline and extension API.",
      },
      { property: "og:title", content: "RetailX Documentation" },
      {
        property: "og:description",
        content: "Guides for the canvas, tokens, CMS, motion, publishing and the extension API.",
      },
      { name: "twitter:title", content: "RetailX Documentation" },
      { name: "twitter:description", content: "Everything you need to build and ship on RetailX." },
    ],
  }),
  component: Docs,
});

const sections = [
  {
    title: "Getting started",
    items: [
      "Create a workspace and invite your team",
      "Duplicate a template or generate from a prompt",
      "Understand pages, layers and components",
    ],
  },
  {
    title: "Design system",
    items: [
      "Color, type, spacing and motion tokens",
      "Themes and per-project overrides",
      "Component variants and constraints",
    ],
  },
  {
    title: "Content",
    items: [
      "Model a CMS collection with reference fields",
      "Draft mode, scheduling and localization",
      "Dynamic page generation from collections",
    ],
  },
  {
    title: "Motion & interactions",
    items: [
      "Entrance, hover and scroll animations",
      "Timeline sequencing and spring easing",
      "Trigger → action graphs with conditions",
    ],
  },
  {
    title: "Publishing",
    items: [
      "Preview deployments and review links",
      "Custom domains, SSL and redirects",
      "Sitemap, robots, OG tags and rollback",
    ],
  },
  {
    title: "Extension API",
    items: [
      "Custom panels and canvas tools",
      "Custom CMS field types",
      "Publish hooks and environment variables",
    ],
  },
];

function Docs() {
  return (
    <div className="px-6 pb-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="eyebrow">Documentation</p>
          <h1 className="display-lg mt-4 max-w-3xl">
            Learn the studio, <span className="text-gradient">end to end</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl leading-relaxed">
            The reference below tracks the platform as it ships. Auth, workspaces and the visual
            builder land next — the marketing surface and design system are live today.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, i) => (
            <Reveal key={section.title} delay={i * 60}>
              <article className="glass hover:border-primary/40 h-full rounded-3xl p-7 transition-colors">
                <h2 className="font-display text-lg font-semibold">{section.title}</h2>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="text-muted-foreground flex items-start gap-3 text-sm">
                      <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <div className="glass rounded-3xl p-10">
            <h2 className="display-md">Ready to build?</h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
              Create a free workspace and design your first page on the canvas.
            </p>
            <MagneticButton to="/pricing" size="lg" className="mt-8">
              Start free
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
