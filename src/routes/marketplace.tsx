import { createFileRoute } from "@tanstack/react-router";
import { Puzzle } from "lucide-react";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Reveal } from "@/components/site/reveal";
import { marketplaceItems } from "@/lib/site-data";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "RetailX Marketplace — Plugins, UI Kits and Animation Packs" },
      {
        name: "description",
        content:
          "Extend RetailX with plugins, integrations, icon packs, animation libraries and premium UI kits built by the community.",
      },
      { property: "og:title", content: "RetailX Marketplace" },
      {
        property: "og:description",
        content: "Plugins, integrations, icon packs and premium UI kits for RetailX projects.",
      },
      { name: "twitter:title", content: "RetailX Marketplace" },
      {
        name: "twitter:description",
        content: "Install community-built extensions straight into your workspace.",
      },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  return (
    <div className="px-6 pb-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="eyebrow">Marketplace</p>
          <h1 className="display-lg mt-4 max-w-3xl">
            Extend the studio with <span className="text-gradient">community craft</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl leading-relaxed">
            Plugins, integrations, icon packs, animation libraries and UI kits install directly into
            a workspace — versioned, sandboxed and removable in one click.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {marketplaceItems.map((item, i) => (
            <Reveal key={item.name} delay={i * 60}>
              <article className="glass hover:border-accent/40 flex h-full flex-col rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="bg-secondary/70 text-accent grid size-11 place-items-center rounded-2xl">
                    <Puzzle className="size-5" />
                  </div>
                  <span className="text-primary font-display text-sm font-semibold">
                    {item.price}
                  </span>
                </div>
                <p className="eyebrow mt-6">{item.kind}</p>
                <h2 className="font-display mt-2 text-lg font-semibold">{item.name}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.detail}</p>
                <div className="flex-1 pt-6" />
                <MagneticButton variant="glass" size="sm" to="/pricing" className="w-full">
                  Install
                </MagneticButton>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <div className="glass flex flex-col items-start justify-between gap-6 rounded-3xl p-10 sm:flex-row sm:items-center">
            <div>
              <h2 className="display-md">Building something for RetailX?</h2>
              <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
                The extension API covers panels, canvas tools, CMS field types and publish hooks.
                Publish to the marketplace and keep 80% of revenue.
              </p>
            </div>
            <MagneticButton to="/docs" size="lg">
              Read the API docs
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
