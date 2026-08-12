import { createNode } from "./blocks";
import { defaultTheme, uid, type BuilderProject } from "./types";

/** Default page inserted into every new project (also used server-side). */
export const starterPage = () => ({
  id: uid(),
  name: "Home",
  slug: "/",
  seo: {
    title: "RetailX site — built with the visual editor",
    description: "A fast static site designed and published with RetailX.",
  },
  nodes: [
    createNode("hero"),
    createNode("stats"),
    createNode("features"),
    createNode("testimonial"),
    createNode("cta"),
    createNode("footer"),
  ],
});

/** In-memory project factory used by template previews. */
export function createProject(name: string, slug = "site"): BuilderProject {
  return {
    id: uid(),
    name,
    domain: `${slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.retailx.site`,
    theme: { ...defaultTheme },
    pages: [starterPage()],
    deployments: [],
    updatedAt: new Date().toISOString(),
    publishedAt: null,
  };
}
