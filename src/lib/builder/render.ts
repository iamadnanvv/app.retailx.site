import { renderNodeHtml } from "./blocks";
import type { BuilderNode, BuilderPage, BuilderProject, NodeStyle, ProjectTheme } from "./types";

export const mergeStyle = (node: BuilderNode, bp: "base" | "tablet" | "mobile"): NodeStyle => ({
  ...(node.styles.base ?? {}),
  ...(bp !== "base" ? (node.styles[bp] ?? {}) : {}),
});

const shadowCss: Record<string, string> = {
  none: "",
  sm: "0 1px 2px rgba(0,0,0,.18)",
  md: "0 10px 30px -12px rgba(0,0,0,.45)",
  lg: "0 30px 80px -24px rgba(0,0,0,.6)",
  glow: "0 0 0 1px rgba(255,255,255,.08), 0 20px 60px -20px currentColor",
};

function backgroundValue(s: NodeStyle): string {
  if (s.gradient?.enabled) {
    return `linear-gradient(${s.gradient.angle ?? 135}deg, ${s.gradient.from}, ${s.gradient.to})`;
  }
  return s.background ?? "";
}

function sectionCss(s: NodeStyle): string {
  const bg = backgroundValue(s);
  const parts = [
    `padding:${s.paddingY ?? 40}px ${s.paddingX ?? 24}px`,
    bg ? `background:${bg}` : "",
    s.color ? `color:${s.color}` : "",
    s.align ? `text-align:${s.align}` : "",
    s.hidden ? "display:none" : "",
    s.fontSize ? `font-size:${s.fontSize}px` : "",
    s.lineHeight ? `line-height:${s.lineHeight}` : "",
    s.letterSpacing !== undefined ? `letter-spacing:${s.letterSpacing / 100}em` : "",
    s.textTransform && s.textTransform !== "none" ? `text-transform:${s.textTransform}` : "",
    s.fontWeight ? `font-weight:${s.fontWeight}` : "",
    s.animationDelay ? `--rx-delay:${s.animationDelay}ms` : "",
    s.animationDuration ? `--rx-dur:${s.animationDuration}ms` : "",
  ].filter(Boolean);
  return parts.join(";");
}

function innerCss(s: NodeStyle): string {
  const justifyMap: Record<string, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
  };
  const alignMap: Record<string, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
  };
  const shadow = s.shadow && s.shadow !== "none" ? shadowCss[s.shadow] : "";
  const parts = [
    `max-width:${s.maxWidth ?? 1100}px`,
    "margin:0 auto",
    s.radius ? `border-radius:${s.radius}px;overflow:hidden` : "",
    s.border ? `border:${s.border}px solid ${s.borderColor ?? "rgba(255,255,255,.14)"}` : "",
    shadow ? `box-shadow:${shadow}` : "",
    s.layout === "flex"
      ? `display:flex;flex-wrap:wrap;gap:${s.gap ?? 16}px;justify-content:${justifyMap[s.justify ?? "start"]};align-items:${alignMap[s.alignItems ?? "stretch"]}`
      : "",
  ].filter(Boolean);
  return parts.join(";");
}

/** Full HTML for one node, used by both the canvas and static export. */
export function renderNode(node: BuilderNode, theme: ProjectTheme, bp: "base" | "tablet" | "mobile") {
  const s = mergeStyle(node, bp);
  const cols = s.columns ?? 0;
  // Column counts feed CSS custom properties consumed by `.rx-grid` children.
  // The wrapper itself must stay a block element, otherwise headings and grids
  // become sibling grid items and collapse into one narrow column.
  const gridVars =
    cols > 0
      ? `--rx-cols:${cols};--rx-cols-tablet:${Math.min(cols, 2)};--rx-cols-mobile:1;--rx-gap:${s.gap ?? 16}px`
      : `--rx-gap:${s.gap ?? 16}px`;
  const classes = [
    "rx-section",
    s.animation && s.animation !== "none" ? `rx-anim rx-${s.animation}` : "",
    s.hover && s.hover !== "none" ? `rx-hover-${s.hover}` : "",
    s.parallax ? "rx-parallax" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const parallaxAttr = s.parallax ? ` data-rx-speed="${s.parallax}"` : "";
  return `<section data-node="${node.id}"${parallaxAttr} style="${sectionCss(s)}" class="${classes}"><div style="${innerCss(s)};${gridVars}">${renderNodeHtml(node, theme)}</div></section>`;
}


export function renderPageBody(page: BuilderPage, theme: ProjectTheme, bp: "base" | "tablet" | "mobile" = "base") {
  return page.nodes.map((n) => renderNode(n, theme, bp)).join("\n");
}

export function baseCss(theme: ProjectTheme) {
  return `*{box-sizing:border-box}
body{margin:0;background:${theme.background};color:${theme.foreground};font-family:${theme.font};-webkit-font-smoothing:antialiased}
img{max-width:100%}
.rx-grid{display:grid;grid-template-columns:repeat(var(--rx-cols,3),minmax(0,1fr));gap:var(--rx-gap,16px)}
.rx-btn{transition:transform .18s ease,filter .18s ease}
.rx-btn:hover{transform:translateY(-2px);filter:brightness(1.08)}
.rx-anim{opacity:0;transform:translateY(18px);transition:opacity var(--rx-dur,700ms) cubic-bezier(.2,.7,.2,1),transform var(--rx-dur,700ms) cubic-bezier(.2,.7,.2,1),filter var(--rx-dur,700ms) ease;transition-delay:var(--rx-delay,0ms)}
.rx-zoom-in{transform:scale(.96)}
.rx-fade-in{transform:none}
.rx-slide-left{transform:translateX(-40px)}
.rx-slide-right{transform:translateX(40px)}
.rx-blur-in{transform:none;filter:blur(14px)}
.rx-anim.rx-in{opacity:1;transform:none;filter:none}
.rx-section{transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s ease,filter .35s ease;will-change:transform}
.rx-hover-lift:hover{transform:translateY(-6px)}
.rx-hover-grow:hover{transform:scale(1.02)}
.rx-hover-glow:hover{filter:brightness(1.06);box-shadow:0 30px 90px -30px ${theme.accent}}
.rx-hover-tilt:hover{transform:perspective(900px) rotateX(2deg) rotateY(-2deg) scale(1.01)}
@media(prefers-reduced-motion:reduce){.rx-anim{opacity:1;transform:none;filter:none;transition:none}.rx-section{transition:none}}
@media(max-width:1024px){.rx-grid{grid-template-columns:repeat(var(--rx-cols-tablet,2),minmax(0,1fr))}}
@media(max-width:640px){.rx-grid{grid-template-columns:1fr}.rx-section{padding-left:18px!important;padding-right:18px!important}}`;
}

const runtimeJs = `document.addEventListener('DOMContentLoaded',function(){
var rm=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('rx-in');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rx-anim').forEach(function(el){io.observe(el)});
var px=[].slice.call(document.querySelectorAll('.rx-parallax'));
if(px.length&&!rm){var tick=false;var run=function(){tick=false;var vh=window.innerHeight;px.forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;var sp=parseFloat(el.getAttribute('data-rx-speed'))||0;var d=(r.top+r.height/2-vh/2)/vh;var c=el.firstElementChild;if(c)c.style.transform='translate3d(0,'+(-d*sp*60).toFixed(2)+'px,0)'})};
window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(run)}},{passive:true});run()}
document.querySelectorAll('.rx-form').forEach(function(f){f.addEventListener('submit',function(ev){ev.preventDefault();f.querySelectorAll('input,textarea,button').forEach(function(i){i.disabled=true});var m=f.querySelector('.rx-form-msg');if(m)m.style.display='block';})});
});`;

/** Collapses safe whitespace for production output without touching text content. */
export function minifyHtml(html: string) {
  return html
    .replace(/\n\s*/g, "\n")
    .replace(/>\n+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function minifyCss(css: string) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/\s+/g, " ")
    .trim();
}

export function renderPageDocument(project: BuilderProject, page: BuilderPage, opts?: { minify?: boolean }) {
  const canonical = `https://${project.domain}${page.slug === "/" ? "/" : page.slug}`;
  const css = opts?.minify ? minifyCss(baseCss(project.theme)) : baseCss(project.theme);
  const title = page.seo.title || page.name;
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${page.seo.description}"/>
<link rel="canonical" href="${canonical}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${page.seo.description}"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&display=swap" media="all"/>
<style>${css}</style>
</head>
<body>
${renderPageBody(page, project.theme)}
<script defer>${runtimeJs}</script>
</body>
</html>`;
  return opts?.minify ? minifyHtml(doc) : doc;
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
    content: renderPageDocument(project, page, { minify: true }),
  }));
  files.push({ path: "sitemap.xml", content: renderSitemap(project) });
  files.push({
    path: "robots.txt",
    content: `User-agent: *\nAllow: /\nSitemap: https://${project.domain}/sitemap.xml\n`,
  });
  files.push({
    path: "_headers",
    content: `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
  });
  const bytes = files.reduce((n, f) => n + new Blob([f.content]).size, 0);
  return { files, bytes };
}

