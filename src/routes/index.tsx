import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Cloud,
  Command,
  Gauge,
  Layers,
  MousePointerClick,
  Palette,
  Rocket,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import heroImage from "@/assets/hero-abstract.jpg";
import builderImage from "@/assets/builder-canvas.jpg";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Reveal } from "@/components/site/reveal";
import { templates } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RetailX — Build Ultra-Fast Sites on an Infinite Canvas" },
      {
        name: "description",
        content:
          "Design on an infinite canvas, wire real interactions, manage content with a built-in CMS, and publish static sites to the edge in one click.",
      },
      { property: "og:title", content: "RetailX — Visual Static Site Builder" },
      {
        property: "og:description",
        content:
          "Infinite canvas design, CMS, animation engine and one-click edge publishing for creators and agencies.",
      },
      { name: "twitter:title", content: "RetailX — Visual Static Site Builder" },
      {
        name: "twitter:description",
        content: "Design, animate and publish static sites at 100/100 performance.",
      },
    ],
  }),
  component: Home,
});

const pillars = [
  {
    icon: Layers,
    title: "Infinite canvas",
    body: "Zoom, pan, snap to smart guides and design across every breakpoint on one surface.",
  },
  {
    icon: Palette,
    title: "Token-driven styles",
    body: "Colors, type, spacing and motion live as variables. Change one, update everything.",
  },
  {
    icon: MousePointerClick,
    title: "Interaction builder",
    body: "Chain triggers and actions visually — scroll, hover, drag, viewport, timers.",
  },
  {
    icon: Boxes,
    title: "Component system",
    body: "Variants, symbols and constraints so a design scales without copy-paste drift.",
  },
  {
    icon: Wand2,
    title: "AI co-designer",
    body: "Generate sections, copy, palettes and accessibility fixes from a single prompt.",
  },
  {
    icon: Cloud,
    title: "Edge publishing",
    body: "Static output, instant invalidation, preview URLs, rollbacks and custom domains.",
  },
];

const stats = [
  { value: "100", label: "Lighthouse performance target" },
  { value: "<40ms", label: "Median edge response" },
  { value: "300+", label: "Blocks and templates" },
  { value: "1-click", label: "Publish and rollback" },
];

const steps = [
  {
    icon: Sparkles,
    title: "Start from a prompt or template",
    body: "Describe the site or duplicate a category template with CMS wired in already.",
  },
  {
    icon: Command,
    title: "Design and wire it up",
    body: "Auto-layout, tokens, variants, animations and interactions — no code required.",
  },
  {
    icon: Rocket,
    title: "Publish to the edge",
    body: "Static build, sitemap, robots, OG tags and SSL configured automatically.",
  },
];

function Home() {
  return (
    <div>
      <section className="relative px-6 pt-10 pb-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="glass text-muted-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs">
            <span className="bg-primary size-1.5 animate-pulse rounded-full" />
            Now in open beta — creator plan is free forever
          </Reveal>

          <Reveal delay={80} as="h1" className="display-xl mt-8 max-w-4xl">
            Design bold. <span className="text-gradient">Publish fast.</span> Own every pixel.
          </Reveal>

          <Reveal
            delay={160}
            as="p"
            className="text-muted-foreground mt-8 max-w-2xl text-lg leading-relaxed"
          >
            RetailX is the visual studio for high-performance static websites. An infinite canvas for
            layout, a real design-token system, a built-in CMS, a motion engine, and one-click edge
            publishing — all in one workspace.
          </Reveal>

          <Reveal delay={240} className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton size="lg" to="/pricing">
              Start building free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
            <MagneticButton size="lg" variant="glass" to="/templates">
              Browse templates
            </MagneticButton>
          </Reveal>

          <Reveal delay={320} className="relative mt-16">
            <div className="glass shadow-[var(--shadow-lift)] overflow-hidden rounded-[2.5rem] p-2">
              <img
                src={heroImage}
                alt="Abstract glass panels lit by lime and cyan gradient light streaks"
                width={1600}
                height={1200}
                className="h-[38vh] w-full rounded-[2rem] object-cover sm:h-[52vh]"
              />
            </div>
            <div className="glass animate-float absolute -bottom-6 left-6 hidden rounded-2xl px-5 py-3 text-sm sm:block">
              <span className="text-muted-foreground">Publish time</span>{" "}
              <span className="text-primary font-semibold">1.8s</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-border/60 border-y px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70}>
              <p className="display-md text-gradient">{stat.value}</p>
              <p className="text-muted-foreground mt-2 text-sm">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="eyebrow">The studio</p>
            <h2 className="display-lg mt-4 max-w-2xl">
              Everything a professional site needs, in one surface
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 60}>
                <article className="glass hover:border-primary/40 group h-full rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-secondary/70 text-primary grid size-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
                    <pillar.icon className="size-5" />
                  </div>
                  <h3 className="font-display mt-6 text-lg font-semibold">{pillar.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Visual builder</p>
            <h2 className="display-lg mt-4">A canvas that behaves like a pro design tool</h2>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              Rulers, snapping, smart guides, multi-select, grouping, locking, absolute positioning
              and auto-layout. Keyboard shortcuts for everything, undo history that never loses a
              step, and autosave on every change.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Layers, pages, assets, CMS and variables in one collapsible sidebar",
                "Contextual inspector for layout, type, effects, motion and SEO",
                "Desktop, laptop, tablet, mobile and custom breakpoints",
                "Real-time collaboration with roles and review comments",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass shadow-[var(--shadow-lift)] overflow-hidden rounded-[2rem] p-2">
              <img
                src={builderImage}
                alt="Dark visual website builder interface showing an infinite canvas with wireframe blocks"
                width={1600}
                height={1104}
                loading="lazy"
                className="w-full rounded-[1.6rem] object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-border/60 overflow-hidden border-y py-8">
        <div className="animate-marquee flex w-max gap-4">
          {[...templates, ...templates].map((template, i) => (
            <span
              key={`${template.name}-${i}`}
              className="glass text-muted-foreground rounded-full px-5 py-2 text-sm whitespace-nowrap"
            >
              {template.category} · {template.name}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="eyebrow">Workflow</p>
            <h2 className="display-lg mt-4 max-w-xl">From blank canvas to live site in minutes</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 90}>
                <article className="glass h-full rounded-3xl p-8">
                  <span className="font-display text-muted-foreground/50 text-5xl font-bold">
                    0{i + 1}
                  </span>
                  <step.icon className="text-primary mt-6 size-5" />
                  <h3 className="font-display mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{step.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {[
            {
              icon: Gauge,
              title: "Performance budgets",
              body: "Every publish is measured against Core Web Vitals before it ships.",
            },
            {
              icon: Search,
              title: "SEO suite",
              body: "Titles, canonicals, schema, sitemap and alt-text validation with scoring.",
            },
            {
              icon: Layers,
              title: "Version history",
              body: "Named snapshots, diffs and instant rollback to any previous deployment.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <article className="glass h-full rounded-3xl p-7">
                <item.icon className="text-accent size-5" />
                <h3 className="font-display mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 pb-32">
        <Reveal className="mx-auto max-w-5xl">
          <div className="glass relative overflow-hidden rounded-[2.5rem] px-8 py-20 text-center">
            <div className="aurora animate-drift absolute -inset-1/2 opacity-70" aria-hidden />
            <div className="relative">
              <h2 className="display-lg mx-auto max-w-2xl">
                Your next site deserves a <span className="text-gradient">studio</span>, not a
                template wall
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-xl">
                Start free, invite your team, and publish when it feels perfect.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <MagneticButton size="lg" to="/pricing">
                  Start free
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </MagneticButton>
                <MagneticButton size="lg" variant="glass" to="/marketplace">
                  Explore marketplace
                </MagneticButton>
              </div>
              <p className="text-muted-foreground mt-8 text-xs">
                Prefer to read first?{" "}
                <Link to="/docs" className="text-foreground underline underline-offset-4">
                  Browse the docs
                </Link>
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
