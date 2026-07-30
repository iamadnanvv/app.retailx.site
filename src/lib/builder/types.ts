export type Breakpoint = "base" | "tablet" | "mobile";

export type NodeStyle = {
  paddingY?: number;
  paddingX?: number;
  align?: "left" | "center" | "right";
  background?: string;
  color?: string;
  maxWidth?: number;
  radius?: number;
  hidden?: boolean;
  columns?: number;
  gap?: number;
  fontSize?: number;
  animation?: "none" | "fade-up" | "fade-in" | "zoom-in";
};

export type BlockType =
  | "hero"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "features"
  | "pricing"
  | "testimonial"
  | "faq"
  | "stats"
  | "cta"
  | "gallery"
  | "form"
  | "footer"
  | "spacer"
  | "embed";

export type BuilderNode = {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  styles: Partial<Record<Breakpoint, NodeStyle>>;
  locked?: boolean;
};

export type BuilderPage = {
  id: string;
  name: string;
  slug: string;
  seo: { title: string; description: string };
  nodes: BuilderNode[];
};

export type ProjectTheme = {
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  font: string;
  radius: number;
};

export type Deployment = {
  id: string;
  at: string;
  pages: number;
  bytes: number;
  status: "live" | "rolled-back";
  note: string;
};

export type BuilderProject = {
  id: string;
  name: string;
  domain: string;
  theme: ProjectTheme;
  pages: BuilderPage[];
  deployments: Deployment[];
  updatedAt: string;
  publishedAt: string | null;
};

export const defaultTheme: ProjectTheme = {
  accent: "#c2f24a",
  background: "#0e1116",
  foreground: "#f3f5f7",
  muted: "#a5adb8",
  font: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  radius: 20,
};

export const uid = () => Math.random().toString(36).slice(2, 10);
