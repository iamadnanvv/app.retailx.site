import { createFileRoute } from "@tanstack/react-router";
import { Check, Database, Moon, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Reveal } from "@/components/site/reveal";
import { templateCategories, templates } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/templates")({
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

const accentClass = {
  primary: "text-primary",
  accent: "text-accent",
  ember: "text-ember",
} as const;

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

  const visible = useMemo(
    () => (active === "All" ? templates : templates.filter((t) => t.category === active)),
    [active],
  );

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
          {templateCategories.map((category) => (
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

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((template, i) => (
            <Reveal key={template.name} delay={i * 60}>
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
                  <h2 className="font-display text-lg font-semibold">{template.name}</h2>
                  <span className={cn("text-xs font-medium", accentClass[template.accent])}>
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
                  {template.cms && (
                    <span className="inline-flex items-center gap-1">
                      <Database className="size-3.5" /> CMS
                    </span>
                  )}
                </div>

                <div className="mt-5 grid gap-2.5">
                  <Score label="SEO" value={template.seo} />
                  <Score label="Accessibility" value={template.a11y} />
                  <Score label="Performance" value={template.perf} />
                </div>

                <div className="mt-6 flex-1" />
                <MagneticButton variant="glass" size="sm" to="/pricing" className="w-full">
                  <Check className="size-4" /> Duplicate template
                </MagneticButton>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
