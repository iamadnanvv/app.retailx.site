import { createFileRoute } from "@tanstack/react-router";

/** Serves the published static files for a site. */
export const Route = createFileRoute("/s/$projectId/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { projectId, _splat } = params as { projectId: string; _splat?: string };
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("projects")
          .select("published_html")
          .eq("id", projectId)
          .maybeSingle();
        if (!data?.published_html) {
          return new Response("This site hasn't been published yet.", {
            status: 404,
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
        }
        const { resolvePublishedFile } = await import("@/lib/publish.server");
        const map = JSON.parse(data.published_html) as Record<string, string>;
        const file = resolvePublishedFile(map, _splat ?? "");
        if (!file.body) return new Response("Page not found", { status: 404 });
        return new Response(file.body, {
          headers: { "content-type": file.type, "cache-control": "public, max-age=60" },
        });
      },
    },
  },
});
