/**
 * Server-only data access helpers.
 *
 * Every table is locked down (RLS on, no policies) so the ONLY way to reach
 * data is through these helpers, which run with the service client after the
 * caller's Clerk session token has been verified.
 */
import { getRequestHeader } from "@tanstack/react-start/server";
import { verifySessionToken, type SessionUser } from "./auth.server";

export type Role = "owner" | "admin" | "editor" | "developer" | "viewer";

const RANK: Record<Role, number> = {
  viewer: 1,
  developer: 2,
  editor: 3,
  admin: 4,
  owner: 5,
};

export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const header = getRequestHeader("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7) : null;
  const user = await verifySessionToken(token);
  if (!user) throw new HttpError(401, "You need to sign in to do that.");
  return user;
}

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "workspace"
  );
}

export async function uniqueSlug(table: "workspaces", base: string) {
  const db = await admin();
  let slug = slugify(base);
  for (let i = 0; i < 30; i++) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    const { data } = await db.from(table).select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${slug}-${Date.now().toString(36)}`;
}

/** Membership rows for the caller, creating a personal workspace on first use. */
export async function listMemberships(user: SessionUser) {
  const db = await admin();
  const { data, error } = await db
    .from("workspace_members")
    .select("id, role, status, workspace_id, workspaces(id, name, slug, plan, owner_user_id, logo_url, accent)")
    .eq("user_id", user.userId)
    .eq("status", "active");
  if (error) throw new HttpError(500, error.message);
  return data ?? [];
}

export async function ensureWorkspace(user: SessionUser) {
  const db = await admin();
  const existing = await listMemberships(user);
  if (existing.length) return existing;

  // Claim any pending email invitation for this user first.
  if (user.email) {
    await db
      .from("workspace_members")
      .update({ user_id: user.userId, status: "active", name: user.name, avatar_url: user.imageUrl })
      .eq("email", user.email.toLowerCase())
      .is("user_id", null);
    const claimed = await listMemberships(user);
    if (claimed.length) return claimed;
  }

  const name = user.name ? `${user.name.split(" ")[0]}'s workspace` : "My workspace";
  const slug = await uniqueSlug("workspaces", name);
  const { data: ws, error } = await db
    .from("workspaces")
    .insert({ name, slug, owner_user_id: user.userId, plan: "free" })
    .select("id")
    .single();
  if (error) throw new HttpError(500, error.message);
  await db.from("workspace_members").insert({
    workspace_id: ws.id,
    user_id: user.userId,
    email: (user.email ?? `${user.userId}@retailx.local`).toLowerCase(),
    name: user.name,
    avatar_url: user.imageUrl,
    role: "owner",
    status: "active",
  });
  return listMemberships(user);
}

/** Throws unless the caller has at least `min` permission in the workspace. */
export async function assertWorkspaceRole(user: SessionUser, workspaceId: string, min: Role = "viewer") {
  const db = await admin();
  const { data } = await db
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.userId)
    .eq("status", "active")
    .maybeSingle();
  const role = data?.role as Role | undefined;
  if (!role) throw new HttpError(403, "You don't have access to this workspace.");
  if (RANK[role] < RANK[min]) throw new HttpError(403, `This action requires ${min} permission.`);
  return role;
}

/** Loads a project and verifies the caller's permission on its workspace. */
export async function loadProjectFor(user: SessionUser, projectId: string, min: Role = "viewer") {
  const db = await admin();
  const { data, error } = await db.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Project not found.");
  const role = await assertWorkspaceRole(user, data.workspace_id, min);
  return { project: data, role };
}

export async function logActivity(input: {
  workspaceId: string;
  projectId?: string | null;
  user: SessionUser;
  action: string;
  target?: string | null;
  meta?: Record<string, unknown>;
}) {
  const db = await admin();
  await db.from("activity_logs").insert({
    workspace_id: input.workspaceId,
    project_id: input.projectId ?? null,
    user_id: input.user.userId,
    actor: input.user.name ?? input.user.email ?? "Someone",
    action: input.action,
    target: input.target ?? null,
    meta: (input.meta ?? {}) as never,
  });
}

export { slugify };
