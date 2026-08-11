import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        const projectId = typeof body.projectId === "string" ? body.projectId : null;
        if (!projectId) return new Response("Missing projectId", { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: project } = await supabaseAdmin.from("projects").select("id").eq("id", projectId).maybeSingle();
        if (!project) return new Response("Unknown site", { status: 404 });
        const { createHash } = await import("node:crypto");
        const fingerprint = createHash("sha256")
          .update(
            [
              request.headers.get("x-forwarded-for") ?? "",
              request.headers.get("user-agent") ?? "",
              new Date().toISOString().slice(0, 10),
            ].join("|"),
          )
          .digest("hex")
          .slice(0, 32);
        await supabaseAdmin.from("page_views").insert({
          project_id: projectId,
          path: typeof body.path === "string" ? body.path.slice(0, 300) : "/",
          referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 300) : null,
          device: typeof body.device === "string" ? body.device.slice(0, 20) : "desktop",
          session_id: fingerprint,
        } as never);
        return new Response(null, { status: 204 });
      },
    },
  },
});
