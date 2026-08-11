import { createFileRoute } from "@tanstack/react-router";

/** Home page of a published site. */
export const Route = createFileRoute("/s/$projectId/")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { projectId } = params as { projectId: string };
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
        const map = JSON.parse(data.published_html) as Record<string, string>;
        return new Response(map["index.html"] ?? "Page not found", {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" },
        });
      },
    },
  },
});
