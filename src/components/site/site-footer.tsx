import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/site/brand-mark";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Visual builder", to: "/" },
      { label: "Templates", to: "/templates" },
      { label: "Marketplace", to: "/marketplace" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", to: "/docs" },
      { label: "Roadmap", to: "/docs" },
      { label: "Changelog", to: "/docs" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-border/60 border-t px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <BrandMark size={30} />
          </div>
          <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
            The creator-first static site studio. Design on an infinite canvas, publish to a global
            edge network in one click.
          </p>
        </div>

        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="eyebrow">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="text-muted-foreground mx-auto mt-12 flex max-w-6xl flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} RetailX.site — built for creators.</p>
        <p>Static output. Edge delivered. Zero cold starts.</p>
      </div>
    </footer>
  );
}
