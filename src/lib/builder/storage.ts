import { createNode } from "./blocks";
import { defaultTheme, uid, type BuilderProject } from "./types";

const STORAGE_KEY = "retailx.projects.v1";

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

export function loadProjects(): BuilderProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = [createProject("Acme Launch", "acme-launch")];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as BuilderProject[];
  } catch {
    return [];
  }
}

export function saveProjects(projects: BuilderProject[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new CustomEvent("retailx:projects"));
}

export function upsertProject(project: BuilderProject) {
  const all = loadProjects();
  const next = all.some((p) => p.id === project.id)
    ? all.map((p) => (p.id === project.id ? project : p))
    : [...all, project];
  saveProjects(next);
}

export function deleteProject(id: string) {
  saveProjects(loadProjects().filter((p) => p.id !== id));
}

export function duplicateProject(id: string) {
  const source = loadProjects().find((p) => p.id === id);
  if (!source) return;
  const copy: BuilderProject = {
    ...structuredClone(source),
    id: uid(),
    name: `${source.name} copy`,
    deployments: [],
    publishedAt: null,
  };
  upsertProject(copy);
  return copy;
}
