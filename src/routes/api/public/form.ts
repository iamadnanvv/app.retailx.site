import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/form")({
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
        const payload = body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : {};
        if (!projectId) return new Response("Missing projectId", { status: 400 });
        if (Object.keys(payload).length === 0 || Object.keys(payload).length > 40) {
          return new Response("Invalid submission", { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: project } = await supabaseAdmin.from("projects").select("id").eq("id", projectId).maybeSingle();
        if (!project) return new Response("Unknown site", { status: 404 });

        const text = Object.values(payload).map(String).join(" ").toLowerCase();
        const spam = /(https?:\/\/){3,}|viagra|casino|crypto airdrop/.test(text) || text.length > 8000;
        const { error } = await supabaseAdmin.from("form_submissions").insert({
          project_id: projectId,
          form_name: typeof body.formName === "string" ? body.formName.slice(0, 60) : "contact",
          data: payload as never,
          spam,
        } as never);
        if (error) return new Response("Could not save submission", { status: 500 });
        return Response.json({ ok: true });
      },
    },
  },
});
