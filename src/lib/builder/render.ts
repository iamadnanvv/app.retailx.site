import { renderNodeHtml } from "./blocks";
import type { BuilderNode, BuilderPage, BuilderProject, NodeStyle, ProjectTheme } from "./types";

export const mergeStyle = (node: BuilderNode, bp: "base" | "tablet" | "mobile"): NodeStyle => ({
  ...(node.styles.base ?? {}),
  ...(bp !== "base" ? (node.styles[bp] ?? {}) : {}),
});

function sectionCss(s: NodeStyle): string {
  const parts = [
    `padding:${s.paddingY ?? 40}px ${s.paddingX ?? 24}px`,
    s.background ? `background:${s.background}` : "",
    s.color ? `color:${s.color}` : "",
    s.align ? `text-align:${s.align}` : "",
    s.hidden ? "display:none" : "",
    s.fontSize ? `font-size:${s.fontSize}px` : "",
  ].filter(Boolean);
  return parts.join(";");
}

function innerCss(s: NodeStyle): string {
  const parts = [
    `max-width:${s.maxWidth ?? 1100}px`,
    "margin:0 auto",
    s.radius ? `border-radius:${s.radius}px;overflow:hidden` : "",
    s.columns ? `display:grid;grid-template-columns:repeat(${s.columns},minmax(0,1fr));gap:${s.gap ?? 16}px` : "",
    s.align === "center" ? "justify-content:center" : s.align === "right" ? "justify-content:flex-end" : "",
  ].filter(Boolean);
  return parts.join(";");
}

/** Full HTML for one node, used by both the canvas and static export. */
export function renderNode(node: BuilderNode, theme: ProjectTheme, bp: "base" | "tablet" | "mobile") {
  const s = mergeStyle(node, bp);
  const cols = s.columns ?? 0;
  const gridStyle =
    cols > 0
      ? `--rx-cols:${cols};--rx-cols-tablet:${Math.min(cols, 2)};--rx-cols-mobile:1;gap:${s.gap ?? 16}px`
      : "";
  return `<section data-node="${node.id}" style="${sectionCss(s)}" class="rx-section${s.animation && s.animation !== "none" ? ` rx-anim rx-${s.animation}` : ""}"><div style="${innerCss(s)};${gridStyle}">${renderNodeHtml(node, theme)}</div></section>`;
}

export function renderPageBody(page: BuilderPage, theme: ProjectTheme, bp: "base" | "tablet" | "mobile" = "base") {
  return page.nodes.map((n) => renderNode(n, theme, bp)).join("\n");
}

export function baseCss(theme: ProjectTheme) {
  return `*{box-sizing:border-box}
body{margin:0;background:${theme.background};color:${theme.foreground};font-family:${theme.font};-webkit-font-smoothing:antialiased}
img{max-width:100%}
.rx-grid{display:grid;grid-template-columns:repeat(var(--rx-cols,3),minmax(0,1fr));gap:inherit}
.rx-btn{transition:transform .18s ease,filter .18s ease}
.rx-btn:hover{transform:translateY(-2px);filter:brightness(1.08)}
.rx-anim{opacity:0;transform:translateY(18px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.rx-zoom-in{transform:scale(.96)}
.rx-fade-in{transform:none}
.rx-anim.rx-in{opacity:1;transform:none}
@media(max-width:1024px){.rx-grid{grid-template-columns:repeat(var(--rx-cols-tablet,2),minmax(0,1fr))}}
@media(max-width:640px){.rx-grid{grid-template-columns:1fr}.rx-section{padding-left:18px!important;padding-right:18px!important}}`;
}

const runtimeJs = `document.addEventListener('DOMContentLoaded',function(){
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('rx-in');io.unobserve(e.target)}})},{threshold:.15});
document.querySelectorAll('.rx-anim').forEach(function(el){io.observe(el)});
document.querySelectorAll('.rx-form').forEach(function(f){f.addEventListener('submit',function(ev){ev.preventDefault();f.querySelectorAll('input,textarea,button').forEach(function(i){i.disabled=true});var m=f.querySelector('.rx-form-msg');if(m)m.style.display='block';})});
});`;

export function renderPageDocument(project: BuilderProject, page: BuilderPage) {
  const canonical = `https://${project.domain}${page.slug === "/" ? "/" : page.slug}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${page.seo.title || page.name}</title>
<meta name="description" content="${page.seo.description}"/>
<link rel="canonical" href="${canonical}"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${page.seo.title || page.name}"/>
<meta property="og:description" content="${page.seo.description}"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&display=swap"/>
<style>${baseCss(project.theme)}</style>
</head>
<body>
${renderPageBody(page, project.theme)}
<script>${runtimeJs}</script>
</body>
</html>`;
}

export function renderSitemap(project: BuilderProject) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${project.pages
  .map((p) => `  <url><loc>https://${project.domain}${p.slug === "/" ? "/" : p.slug}</loc></url>`)
  .join("\n")}
</urlset>`;
}

export function buildStaticSite(project: BuilderProject) {
  const files: { path: string; content: string }[] = project.pages.map((page) => ({
    path: page.slug === "/" ? "index.html" : `${page.slug.replace(/^\//, "")}/index.html`,
    content: renderPageDocument(project, page),
  }));
  files.push({ path: "sitemap.xml", content: renderSitemap(project) });
  files.push({
    path: "robots.txt",
    content: `User-agent: *\nAllow: /\nSitemap: https://${project.domain}/sitemap.xml\n`,
  });
  const bytes = files.reduce((n, f) => n + new Blob([f.content]).size, 0);
  return { files, bytes };
}
