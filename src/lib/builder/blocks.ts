import type { BlockType, BuilderNode, NodeStyle, ProjectTheme } from "./types";
import { uid } from "./types";

export type FieldType = "text" | "textarea" | "url" | "list";

export type FieldDef = { key: string; label: string; type: FieldType };

export type BlockDef = {
  type: BlockType;
  label: string;
  group: "Layout" | "Content" | "Marketing" | "Media" | "Advanced";
  fields: FieldDef[];
  defaultProps: Record<string, unknown>;
  defaultStyle: NodeStyle;
};

export const escapeHtml = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : String(v ?? "").split("\n").filter(Boolean);

export const blockDefs: BlockDef[] = [
  {
    type: "hero",
    label: "Hero section",
    group: "Marketing",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Headline", type: "textarea" },
      { key: "subtitle", label: "Subhead", type: "textarea" },
      { key: "primary", label: "Primary button", type: "text" },
      { key: "primaryHref", label: "Primary link", type: "url" },
      { key: "secondary", label: "Secondary button", type: "text" },
    ],
    defaultProps: {
      eyebrow: "New — v2 is here",
      title: "Design fast sites\nwithout the code",
      subtitle: "A visual canvas, a real component library, and one-click edge publishing.",
      primary: "Start building",
      primaryHref: "#",
      secondary: "See templates",
    },
    defaultStyle: { paddingY: 120, paddingX: 24, align: "center", maxWidth: 900, animation: "fade-up" },
  },
  {
    type: "heading",
    label: "Heading",
    group: "Content",
    fields: [
      { key: "text", label: "Text", type: "textarea" },
      { key: "level", label: "Level (1-4)", type: "text" },
    ],
    defaultProps: { text: "A section heading", level: "2" },
    defaultStyle: { paddingY: 32, paddingX: 24, align: "left", maxWidth: 1100 },
  },
  {
    type: "text",
    label: "Paragraph",
    group: "Content",
    fields: [{ key: "text", label: "Text", type: "textarea" }],
    defaultProps: {
      text: "Write something meaningful here. This paragraph inherits your global typography tokens.",
    },
    defaultStyle: { paddingY: 16, paddingX: 24, align: "left", maxWidth: 760 },
  },
  {
    type: "button",
    label: "Button",
    group: "Content",
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "href", label: "Link", type: "url" },
    ],
    defaultProps: { label: "Get started", href: "#" },
    defaultStyle: { paddingY: 16, paddingX: 24, align: "left", maxWidth: 1100 },
  },
  {
    type: "image",
    label: "Image",
    group: "Media",
    fields: [
      { key: "src", label: "Image URL", type: "url" },
      { key: "alt", label: "Alt text", type: "text" },
    ],
    defaultProps: {
      src: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=1400&q=80",
      alt: "Abstract gradient artwork",
    },
    defaultStyle: { paddingY: 32, paddingX: 24, maxWidth: 1100, radius: 24, animation: "zoom-in" },
  },
  {
    type: "gallery",
    label: "Gallery",
    group: "Media",
    fields: [{ key: "images", label: "Image URLs (one per line)", type: "list" }],
    defaultProps: {
      images: [
        "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
        "https://images.unsplash.com/photo-1614851099511-773084f6911d?w=800&q=80",
      ],
    },
    defaultStyle: { paddingY: 48, paddingX: 24, maxWidth: 1100, columns: 3, gap: 16, radius: 20 },
  },
  {
    type: "features",
    label: "Feature grid",
    group: "Marketing",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Items — 'Title | Description' per line", type: "list" },
    ],
    defaultProps: {
      title: "Everything you need",
      items: [
        "Infinite canvas | Zoom, pan, snap and align with pixel precision.",
        "Design tokens | Change one variable, update the entire site.",
        "Edge publishing | Static output deployed to a global CDN.",
      ],
    },
    defaultStyle: { paddingY: 80, paddingX: 24, maxWidth: 1100, columns: 3, gap: 20, animation: "fade-up" },
  },
  {
    type: "stats",
    label: "Stats bar",
    group: "Marketing",
    fields: [{ key: "items", label: "Stats — 'Value | Label' per line", type: "list" }],
    defaultProps: {
      items: ["100/100 | Lighthouse", "38ms | TTFB", "300+ | Templates", "12k | Creators"],
    },
    defaultStyle: { paddingY: 56, paddingX: 24, maxWidth: 1100, columns: 4, gap: 16 },
  },
  {
    type: "pricing",
    label: "Pricing table",
    group: "Marketing",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "plans", label: "Plans — 'Name | Price | Feature, Feature' per line", type: "list" },
    ],
    defaultProps: {
      title: "Simple pricing",
      plans: [
        "Free | $0 | 1 site, RetailX subdomain, Community support",
        "Pro | $24 | Unlimited sites, Custom domain, CMS, Analytics",
        "Business | $59 | Team seats, Roles, Audit logs, Priority support",
      ],
    },
    defaultStyle: { paddingY: 80, paddingX: 24, maxWidth: 1100, columns: 3, gap: 20 },
  },
  {
    type: "testimonial",
    label: "Testimonial",
    group: "Marketing",
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "author", label: "Author", type: "text" },
      { key: "role", label: "Role", type: "text" },
    ],
    defaultProps: {
      quote: "We shipped our marketing site in an afternoon and it still scores 100 on Lighthouse.",
      author: "Mara Chen",
      role: "Head of Design, Northwind",
    },
    defaultStyle: { paddingY: 72, paddingX: 24, align: "center", maxWidth: 820 },
  },
  {
    type: "faq",
    label: "FAQ",
    group: "Content",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Q&A — 'Question | Answer' per line", type: "list" },
    ],
    defaultProps: {
      title: "Frequently asked",
      items: [
        "Is the output really static? | Yes — every publish emits pre-rendered HTML and CSS.",
        "Can I use a custom domain? | Add it in Publish settings with automatic SSL.",
      ],
    },
    defaultStyle: { paddingY: 72, paddingX: 24, maxWidth: 860, gap: 12 },
  },
  {
    type: "cta",
    label: "Call to action",
    group: "Marketing",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "label", label: "Button label", type: "text" },
      { key: "href", label: "Button link", type: "url" },
    ],
    defaultProps: {
      title: "Ready to publish?",
      subtitle: "Go from blank canvas to live site in minutes.",
      label: "Start free",
      href: "#",
    },
    defaultStyle: { paddingY: 88, paddingX: 24, align: "center", maxWidth: 900, radius: 32 },
  },
  {
    type: "form",
    label: "Contact form",
    group: "Marketing",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "fields", label: "Fields (one per line)", type: "list" },
      { key: "label", label: "Submit label", type: "text" },
    ],
    defaultProps: {
      title: "Get in touch",
      fields: ["Name", "Email", "Message"],
      label: "Send message",
    },
    defaultStyle: { paddingY: 72, paddingX: 24, maxWidth: 620 },
  },
  {
    type: "footer",
    label: "Footer",
    group: "Layout",
    fields: [
      { key: "brand", label: "Brand", type: "text" },
      { key: "links", label: "Links (one per line)", type: "list" },
      { key: "note", label: "Legal note", type: "text" },
    ],
    defaultProps: {
      brand: "RetailX",
      links: ["Product", "Templates", "Pricing", "Docs"],
      note: "© 2026 RetailX. All rights reserved.",
    },
    defaultStyle: { paddingY: 48, paddingX: 24, maxWidth: 1100 },
  },
  {
    type: "spacer",
    label: "Spacer",
    group: "Layout",
    fields: [],
    defaultProps: {},
    defaultStyle: { paddingY: 48, paddingX: 0 },
  },
  {
    type: "embed",
    label: "Custom code",
    group: "Advanced",
    fields: [{ key: "html", label: "HTML", type: "textarea" }],
    defaultProps: { html: '<div style="text-align:center">Paste any HTML embed here</div>' },
    defaultStyle: { paddingY: 32, paddingX: 24, maxWidth: 1100 },
  },
];

export const blockDefMap = Object.fromEntries(blockDefs.map((b) => [b.type, b])) as Record<
  BlockType,
  BlockDef
>;

export function createNode(type: BlockType): BuilderNode {
  const def = blockDefMap[type];
  return {
    id: uid(),
    type,
    props: structuredClone(def.defaultProps),
    styles: { base: { ...def.defaultStyle } },
  };
}

/** Renders a node's inner HTML. Same output is used in the canvas and in export. */
export function renderNodeHtml(node: BuilderNode, theme: ProjectTheme): string {
  const p = node.props;
  const t = theme;
  const card = `background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:${t.radius}px;padding:24px`;
  const btn = (label: unknown, href: unknown, primary = true) =>
    `<a class="rx-btn" href="${escapeHtml(href || "#")}" style="display:inline-flex;align-items:center;gap:8px;padding:14px 26px;border-radius:999px;font-weight:600;text-decoration:none;${
      primary
        ? `background:${t.accent};color:#0e1116`
        : `background:transparent;color:${t.foreground};border:1px solid rgba(255,255,255,.18)`
    }">${escapeHtml(label)}</a>`;

  switch (node.type) {
    case "hero":
      return `
${p.eyebrow ? `<div style="display:inline-block;padding:6px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.14);font-size:13px;color:${t.muted};margin-bottom:20px">${escapeHtml(p.eyebrow)}</div>` : ""}
<h1 style="font-size:clamp(38px,6vw,76px);line-height:1.02;letter-spacing:-.03em;margin:0 0 18px">${escapeHtml(p.title).replace(/\n/g, "<br/>")}</h1>
<p style="font-size:clamp(16px,2vw,20px);color:${t.muted};margin:0 auto 30px;max-width:640px">${escapeHtml(p.subtitle)}</p>
<div style="display:inline-flex;gap:12px;flex-wrap:wrap">${btn(p.primary, p.primaryHref)}${p.secondary ? btn(p.secondary, "#", false) : ""}</div>`;
    case "heading": {
      const lvl = Math.min(4, Math.max(1, Number(p.level) || 2));
      const size = [58, 42, 30, 22][lvl - 1];
      return `<h${lvl} style="font-size:${size}px;line-height:1.1;letter-spacing:-.02em;margin:0">${escapeHtml(p.text)}</h${lvl}>`;
    }
    case "text":
      return `<p style="margin:0;font-size:17px;line-height:1.7;color:${t.muted}">${escapeHtml(p.text).replace(/\n/g, "<br/>")}</p>`;
    case "button":
      return btn(p.label, p.href);
    case "image":
      return `<img src="${escapeHtml(p.src)}" alt="${escapeHtml(p.alt)}" loading="lazy" style="width:100%;height:auto;display:block;border-radius:inherit"/>`;
    case "gallery":
      return `<div class="rx-grid">${list(p.images)
        .map(
          (src) =>
            `<img src="${escapeHtml(src)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;aspect-ratio:4/3;border-radius:${t.radius}px"/>`,
        )
        .join("")}</div>`;
    case "features":
      return `${p.title ? `<h2 style="font-size:38px;letter-spacing:-.02em;margin:0 0 32px">${escapeHtml(p.title)}</h2>` : ""}
<div class="rx-grid">${list(p.items)
        .map((item) => {
          const [head, body = ""] = item.split("|");
          return `<div style="${card}"><h3 style="margin:0 0 8px;font-size:19px">${escapeHtml(head.trim())}</h3><p style="margin:0;color:${t.muted};line-height:1.6">${escapeHtml(body.trim())}</p></div>`;
        })
        .join("")}</div>`;
    case "stats":
      return `<div class="rx-grid">${list(p.items)
        .map((item) => {
          const [value, label = ""] = item.split("|");
          return `<div><div style="font-size:38px;font-weight:700;letter-spacing:-.02em;color:${t.accent}">${escapeHtml(value.trim())}</div><div style="color:${t.muted};font-size:14px">${escapeHtml(label.trim())}</div></div>`;
        })
        .join("")}</div>`;
    case "pricing":
      return `${p.title ? `<h2 style="font-size:38px;letter-spacing:-.02em;margin:0 0 32px">${escapeHtml(p.title)}</h2>` : ""}
<div class="rx-grid">${list(p.plans)
        .map((plan) => {
          const [name, price = "", feats = ""] = plan.split("|");
          return `<div style="${card};display:flex;flex-direction:column;gap:12px"><div style="font-weight:600">${escapeHtml(name.trim())}</div><div style="font-size:40px;font-weight:700;letter-spacing:-.02em">${escapeHtml(price.trim())}</div><ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px;color:${t.muted};font-size:14px">${feats
            .split(",")
            .filter(Boolean)
            .map((f) => `<li>${escapeHtml(f.trim())}</li>`)
            .join("")}</ul></div>`;
        })
        .join("")}</div>`;
    case "testimonial":
      return `<blockquote style="margin:0;font-size:26px;line-height:1.4;letter-spacing:-.01em">“${escapeHtml(p.quote)}”</blockquote>
<div style="margin-top:18px;color:${t.muted};font-size:14px">${escapeHtml(p.author)} · ${escapeHtml(p.role)}</div>`;
    case "faq":
      return `${p.title ? `<h2 style="font-size:34px;letter-spacing:-.02em;margin:0 0 24px">${escapeHtml(p.title)}</h2>` : ""}
<div class="rx-grid" style="grid-template-columns:1fr">${list(p.items)
        .map((item) => {
          const [q, a = ""] = item.split("|");
          return `<details style="${card}"><summary style="cursor:pointer;font-weight:600">${escapeHtml(q.trim())}</summary><p style="margin:10px 0 0;color:${t.muted};line-height:1.6">${escapeHtml(a.trim())}</p></details>`;
        })
        .join("")}</div>`;
    case "cta":
      return `<div style="${card};padding:56px 32px;background:linear-gradient(140deg, ${t.accent}22, transparent)">
<h2 style="font-size:40px;letter-spacing:-.02em;margin:0 0 10px">${escapeHtml(p.title)}</h2>
<p style="margin:0 0 24px;color:${t.muted}">${escapeHtml(p.subtitle)}</p>${btn(p.label, p.href)}</div>`;
    case "form":
      return `<form class="rx-form" style="${card};display:grid;gap:14px">
${p.title ? `<h2 style="margin:0;font-size:26px;letter-spacing:-.02em">${escapeHtml(p.title)}</h2>` : ""}
${list(p.fields)
  .map((f) =>
    f.toLowerCase().includes("message")
      ? `<textarea name="${escapeHtml(f)}" rows="4" placeholder="${escapeHtml(f)}" required style="padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.25);color:inherit;font:inherit"></textarea>`
      : `<input name="${escapeHtml(f)}" placeholder="${escapeHtml(f)}" required style="padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.25);color:inherit;font:inherit"/>`,
  )
  .join("")}
<button type="submit" style="padding:13px 22px;border-radius:999px;border:0;background:${t.accent};color:#0e1116;font-weight:600;cursor:pointer">${escapeHtml(p.label)}</button>
<p class="rx-form-msg" style="display:none;margin:0;color:${t.accent};font-size:14px">Thanks — your message was received.</p></form>`;
    case "footer":
      return `<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.09);padding-top:24px">
<strong>${escapeHtml(p.brand)}</strong>
<nav style="display:flex;gap:18px;flex-wrap:wrap">${list(p.links)
        .map((l) => `<a href="#" style="color:${t.muted};text-decoration:none;font-size:14px">${escapeHtml(l)}</a>`)
        .join("")}</nav>
<span style="color:${t.muted};font-size:13px">${escapeHtml(p.note)}</span></div>`;
    case "spacer":
      return `<div aria-hidden="true"></div>`;
    case "embed":
      return String(p.html ?? "");
    default:
      return "";
  }
}
