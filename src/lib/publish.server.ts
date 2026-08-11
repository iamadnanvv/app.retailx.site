/**
 * Server-only publishing pipeline: turns a stored project row into the static
 * files that get served for the live site.
 */
import { buildStaticSite } from "./builder/render";
import type { BuilderProject, BuilderPage, ProjectTheme } from "./builder/types";

export type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  theme: unknown;
  pages: unknown;
  settings: unknown;
};

export function rowToProject(row: ProjectRow): BuilderProject {
  return {
    id: row.id,
    name: row.name,
    domain: row.domain ?? `${row.slug}.retailx.site`,
    theme: row.theme as ProjectTheme,
    pages: (row.pages as BuilderPage[]) ?? [],
    deployments: [],
    updatedAt: new Date().toISOString(),
    publishedAt: null,
  };
}

/** Client-side runtime injected into every published page. */
function siteRuntime(projectId: string, origin: string) {
  return `<script>(function(){
var pid=${JSON.stringify(projectId)},base=${JSON.stringify(origin)};
try{navigator.sendBeacon(base+"/api/public/track",JSON.stringify({projectId:pid,path:location.pathname,referrer:document.referrer,device:innerWidth<768?"mobile":innerWidth<1200?"tablet":"desktop"}))}catch(e){}
document.addEventListener("submit",function(e){
var f=e.target;if(!(f instanceof HTMLFormElement))return;e.preventDefault();
var data={};new FormData(f).forEach(function(v,k){data[k]=v});
fetch(base+"/api/public/form",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({projectId:pid,formName:f.getAttribute("name")||"contact",data:data})})
.then(function(r){return r.json()}).then(function(){f.reset();
var ok=document.createElement("p");ok.textContent="Thanks — we received your message.";ok.style.cssText="margin-top:12px;font-weight:600;color:inherit";f.appendChild(ok)})
.catch(function(){alert("Something went wrong. Please try again.")});
},true);
})();</script>`;
}

export function buildPublishedFiles(project: BuilderProject, origin: string) {
  const { files, bytes } = buildStaticSite(project);
  const runtime = siteRuntime(project.id, origin);
  const map: Record<string, string> = {};
  for (const file of files) {
    map[file.path] = file.path.endsWith(".html")
      ? file.content.replace("</body>", `${runtime}</body>`)
      : file.content;
  }
  return { map, bytes, count: files.length };
}

export function resolvePublishedFile(map: Record<string, string>, rawPath: string) {
  const path = rawPath.replace(/^\/+/, "");
  if (!path || path === "index.html") return { body: map["index.html"], type: "text/html; charset=utf-8" };
  if (path === "sitemap.xml") return { body: map["sitemap.xml"], type: "application/xml; charset=utf-8" };
  if (path === "robots.txt") return { body: map["robots.txt"], type: "text/plain; charset=utf-8" };
  const candidates = [path, `${path}/index.html`, `${path.replace(/\/$/, "")}/index.html`];
  for (const candidate of candidates) {
    if (map[candidate]) return { body: map[candidate], type: "text/html; charset=utf-8" };
  }
  return { body: undefined, type: "text/html; charset=utf-8" };
}
