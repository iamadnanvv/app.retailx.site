import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { landingTemplates } from "@/lib/templates/library";

// Sitemap URLs must be absolute; derive the origin from the incoming request so
// preview, published and custom-domain deployments all emit correct <loc> values.
const FALLBACK_ORIGIN = "https://build-sparkle-site-25.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = (() => {
          try {
            return new URL(request.url).origin;
          } catch {
            return FALLBACK_ORIGIN;
          }
        })();
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/templates", changefreq: "weekly", priority: "0.9" },
          { path: "/marketplace", changefreq: "weekly", priority: "0.8" },
          { path: "/pricing", changefreq: "monthly", priority: "0.8" },
          { path: "/docs", changefreq: "weekly", priority: "0.7" },
          ...landingTemplates.map((t) => ({
            path: `/templates/${t.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
        ];


        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${origin}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
