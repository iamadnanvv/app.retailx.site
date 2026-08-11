/**
 * All RetailX platform server functions.
 *
 * Server-only modules are imported *inside* handlers so this file stays safe
 * to import from route/component code.
 */
import { createServerFn } from "@tanstack/react-start";

type Id = { id: string };

const asRecord = (input: unknown) => (input ?? {}) as Record<string, unknown>;
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

/* ------------------------------------------------------------------ */
/* Workspace + account                                                 */
/* ------------------------------------------------------------------ */

export const bootstrap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return { email: str(r.email) || null, name: str(r.name) || null, imageUrl: str(r.imageUrl) || null };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const merged = {
      ...user,
      email: user.email ?? data.email,
      name: user.name ?? data.name,
      imageUrl: user.imageUrl ?? data.imageUrl,
    };
    const memberships = await h.ensureWorkspace(merged);
    const db = await h.admin();
    // Keep the member profile row fresh for team lists.
    await db
      .from("workspace_members")
      .update({ name: merged.name, avatar_url: merged.imageUrl, email: (merged.email ?? `${user.userId}@retailx.local`).toLowerCase() })
      .eq("user_id", user.userId);

    const workspaces = memberships.map((m) => {
      const ws = m.workspaces as unknown as {
        id: string;
        name: string;
        slug: string;
        plan: string;
        owner_user_id: string;
        logo_url: string | null;
        accent: string | null;
      };
      return { ...ws, role: m.role as string };
    });
    return { userId: user.userId, workspaces };
  });

export const updateWorkspace = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return {
      workspaceId: str(r.workspaceId),
      name: typeof r.name === "string" ? r.name : undefined,
      accent: typeof r.accent === "string" ? r.accent : undefined,
      logoUrl: typeof r.logoUrl === "string" ? r.logoUrl : undefined,
      plan: typeof r.plan === "string" ? r.plan : undefined,
    };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "admin");
    const db = await h.admin();
    const patch: Record<string, unknown> = {};
    if (data.name) patch.name = data.name;
    if (data.accent) patch.accent = data.accent;
    if (data.logoUrl) patch.logo_url = data.logoUrl;
    if (data.plan) patch.plan = data.plan;
    const { error } = await db.from("workspaces").update(patch as never).eq("id", data.workspaceId);
    if (error) throw new h.HttpError(500, error.message);
    await h.logActivity({ workspaceId: data.workspaceId, user, action: "updated workspace settings" });
    return { ok: true };
  });

export const listMembers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ workspaceId: str(asRecord(input).workspaceId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "viewer");
    const db = await h.admin();
    const { data: rows, error } = await db
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", data.workspaceId)
      .order("created_at");
    if (error) throw new h.HttpError(500, error.message);
    return rows ?? [];
  });

export const inviteMember = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return { workspaceId: str(r.workspaceId), email: str(r.email).trim().toLowerCase(), role: str(r.role, "editor") };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "admin");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) throw new h.HttpError(400, "Enter a valid email address.");
    const allowed = ["admin", "editor", "developer", "viewer"];
    if (!allowed.includes(data.role)) throw new h.HttpError(400, "Unknown role.");
    const db = await h.admin();
    const { error } = await db.from("workspace_members").upsert(
      {
        workspace_id: data.workspaceId,
        email: data.email,
        role: data.role,
        status: "invited",
        invited_by: user.userId,
      } as never,
      { onConflict: "workspace_id,email" },
    );
    if (error) throw new h.HttpError(500, error.message);
    await h.logActivity({ workspaceId: data.workspaceId, user, action: "invited a teammate", target: data.email });
    return { ok: true };
  });

export const updateMemberRole = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return { memberId: str(r.memberId), role: str(r.role) };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: member } = await db
      .from("workspace_members")
      .select("id, workspace_id, role")
      .eq("id", data.memberId)
      .maybeSingle();
    if (!member) throw new h.HttpError(404, "Member not found.");
    await h.assertWorkspaceRole(user, member.workspace_id, "admin");
    if (member.role === "owner") throw new h.HttpError(400, "The workspace owner's role can't be changed.");
    const { error } = await db.from("workspace_members").update({ role: data.role }).eq("id", data.memberId);
    if (error) throw new h.HttpError(500, error.message);
    await h.logActivity({ workspaceId: member.workspace_id, user, action: `changed a role to ${data.role}` });
    return { ok: true };
  });

export const removeMember = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ memberId: str(asRecord(input).memberId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: member } = await db
      .from("workspace_members")
      .select("id, workspace_id, role, email")
      .eq("id", data.memberId)
      .maybeSingle();
    if (!member) throw new h.HttpError(404, "Member not found.");
    await h.assertWorkspaceRole(user, member.workspace_id, "admin");
    if (member.role === "owner") throw new h.HttpError(400, "The workspace owner can't be removed.");
    await db.from("workspace_members").delete().eq("id", data.memberId);
    await h.logActivity({ workspaceId: member.workspace_id, user, action: "removed a teammate", target: member.email });
    return { ok: true };
  });

export const listActivity = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ workspaceId: str(asRecord(input).workspaceId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "viewer");
    const db = await h.admin();
    const { data: rows } = await db
      .from("activity_logs")
      .select("*")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false })
      .limit(40);
    return rows ?? [];
  });

/* ------------------------------------------------------------------ */
/* API keys                                                            */
/* ------------------------------------------------------------------ */

export const listApiKeys = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ workspaceId: str(asRecord(input).workspaceId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "admin");
    const db = await h.admin();
    const { data: rows } = await db
      .from("api_keys")
      .select("id, name, prefix, created_at, last_used_at, revoked")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    return rows ?? [];
  });

export const createApiKey = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return { workspaceId: str(r.workspaceId), name: str(r.name, "Untitled key") };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "admin");
    const { randomBytes, createHash } = await import("node:crypto");
    const secret = `rx_${randomBytes(24).toString("hex")}`;
    const db = await h.admin();
    const { error } = await db.from("api_keys").insert({
      workspace_id: data.workspaceId,
      name: data.name,
      prefix: secret.slice(0, 11),
      key_hash: createHash("sha256").update(secret).digest("hex"),
      created_by: user.userId,
    } as never);
    if (error) throw new h.HttpError(500, error.message);
    await h.logActivity({ workspaceId: data.workspaceId, user, action: "created an API key", target: data.name });
    return { key: secret };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ id: str(asRecord(input).id) }) as Id)
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: row } = await db.from("api_keys").select("id, workspace_id").eq("id", data.id).maybeSingle();
    if (!row) throw new h.HttpError(404, "Key not found.");
    await h.assertWorkspaceRole(user, row.workspace_id, "admin");
    await db.from("api_keys").update({ revoked: true }).eq("id", data.id);
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const listProjects = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ workspaceId: str(asRecord(input).workspaceId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "viewer");
    const db = await h.admin();
    const { data: rows, error } = await db
      .from("projects")
      .select("id, name, slug, domain, favorite, published_at, updated_at, created_at, theme, pages")
      .eq("workspace_id", data.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new h.HttpError(500, error.message);
    return (rows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      domain: row.domain,
      favorite: row.favorite,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
      pageCount: Array.isArray(row.pages) ? row.pages.length : 0,
      theme: row.theme,
    }));
  });

export const createProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return {
      workspaceId: str(r.workspaceId),
      name: str(r.name, "Untitled site").slice(0, 80),
      templateSlug: typeof r.templateSlug === "string" ? r.templateSlug : null,
    };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "editor");
    const { starterPage } = await import("./builder/storage");
    const { defaultTheme } = await import("./builder/types");
    const { templateBySlug, templateNodes } = await import("./templates/library");

    const template = data.templateSlug ? templateBySlug(data.templateSlug) : undefined;
    const page = starterPage();
    if (template) {
      page.nodes = templateNodes(template);
      page.seo = { title: `${data.name} — ${template.tagline}`, description: template.description };
    }
    const theme = template
      ? { ...defaultTheme, accent: template.accent, font: template.font ?? defaultTheme.font }
      : { ...defaultTheme };

    const db = await h.admin();
    const base = h.slugify(data.name);
    let slug = base;
    for (let i = 1; i < 40; i++) {
      const { data: clash } = await db
        .from("projects")
        .select("id")
        .eq("workspace_id", data.workspaceId)
        .eq("slug", slug)
        .maybeSingle();
      if (!clash) break;
      slug = `${base}-${i + 1}`;
    }
    const { data: row, error } = await db
      .from("projects")
      .insert({
        workspace_id: data.workspaceId,
        name: data.name,
        slug,
        domain: `${slug}.retailx.site`,
        theme: theme as never,
        pages: [page] as never,
        created_by: user.userId,
      } as never)
      .select("id")
      .single();
    if (error) throw new h.HttpError(500, error.message);
    await h.logActivity({ workspaceId: data.workspaceId, projectId: row.id, user, action: "created a site", target: data.name });
    return { id: row.id as string };
  });

export const getProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ projectId: str(asRecord(input).projectId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project, role } = await h.loadProjectFor(user, data.projectId, "viewer");
    const db = await h.admin();
    const { data: deployments } = await db
      .from("deployments")
      .select("id, status, environment, url, log, created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .limit(20);
    return {
      role,
      project: {
        id: project.id,
        workspaceId: project.workspace_id,
        name: project.name,
        slug: project.slug,
        domain: project.domain,
        customDomain: project.custom_domain,
        theme: project.theme,
        pages: project.pages,
        settings: project.settings,
        favorite: project.favorite,
        publishedAt: project.published_at,
        updatedAt: project.updated_at,
      },
      deployments: deployments ?? [],
    };
  });

export const saveProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return {
      projectId: str(r.projectId),
      name: typeof r.name === "string" ? r.name : undefined,
      pages: Array.isArray(r.pages) ? r.pages : undefined,
      theme: r.theme && typeof r.theme === "object" ? r.theme : undefined,
      settings: r.settings && typeof r.settings === "object" ? r.settings : undefined,
      customDomain: typeof r.customDomain === "string" ? r.customDomain : undefined,
    };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "editor");
    const db = await h.admin();
    const patch: Record<string, unknown> = {};
    if (data.name) patch.name = data.name;
    if (data.pages) patch.pages = data.pages;
    if (data.theme) patch.theme = data.theme;
    if (data.settings) patch.settings = data.settings;
    if (data.customDomain !== undefined) patch.custom_domain = data.customDomain || null;
    const { error } = await db.from("projects").update(patch as never).eq("id", project.id);
    if (error) throw new h.HttpError(500, error.message);
    return { ok: true, savedAt: new Date().toISOString() };
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ projectId: str(asRecord(input).projectId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "editor");
    const db = await h.admin();
    await db.from("projects").update({ favorite: !project.favorite }).eq("id", project.id);
    return { favorite: !project.favorite };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ projectId: str(asRecord(input).projectId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "admin");
    const db = await h.admin();
    await db.from("projects").delete().eq("id", project.id);
    await h.logActivity({ workspaceId: project.workspace_id, user, action: "deleted a site", target: project.name });
    return { ok: true };
  });

export const duplicateProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ projectId: str(asRecord(input).projectId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "editor");
    const db = await h.admin();
    const slug = `${project.slug}-copy-${Math.random().toString(36).slice(2, 6)}`;
    const { data: row, error } = await db
      .from("projects")
      .insert({
        workspace_id: project.workspace_id,
        name: `${project.name} copy`,
        slug,
        domain: `${slug}.retailx.site`,
        theme: project.theme,
        pages: project.pages,
        settings: project.settings,
        created_by: user.userId,
      } as never)
      .select("id")
      .single();
    if (error) throw new h.HttpError(500, error.message);
    await h.logActivity({ workspaceId: project.workspace_id, projectId: row.id, user, action: "duplicated a site", target: project.name });
    return { id: row.id as string };
  });

export const publishProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return { projectId: str(r.projectId), environment: str(r.environment, "production") };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "editor");
    const pub = await import("./publish.server");
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const origin = new URL(getRequestUrl()).origin;

    const built = pub.buildPublishedFiles(pub.rowToProject(project as never), origin);
    const liveUrl = `${origin}/s/${project.id}`;
    const db = await h.admin();
    const now = new Date().toISOString();
    if (data.environment === "production") {
      const { error } = await db
        .from("projects")
        .update({ published_html: JSON.stringify(built.map), published_at: now })
        .eq("id", project.id);
      if (error) throw new h.HttpError(500, error.message);
    }
    const log = [
      `Building ${built.count} files…`,
      `Optimised HTML + inlined critical CSS (${(built.bytes / 1024).toFixed(1)} kB)`,
      "Generated sitemap.xml, robots.txt and cache headers",
      `Deployed to ${data.environment}`,
    ].join("\n");
    const { data: deployment, error: depError } = await db
      .from("deployments")
      .insert({
        project_id: project.id,
        status: "success",
        environment: data.environment,
        url: data.environment === "production" ? liveUrl : `${liveUrl}?preview=1`,
        log,
        snapshot: { pages: project.pages, theme: project.theme } as never,
        created_by: user.userId,
      } as never)
      .select("id, url, created_at, status, environment, log")
      .single();
    if (depError) throw new h.HttpError(500, depError.message);
    await h.logActivity({
      workspaceId: project.workspace_id,
      projectId: project.id,
      user,
      action: data.environment === "production" ? "published a site" : "created a preview deployment",
      target: project.name,
    });
    return { deployment, url: liveUrl, files: built.count, bytes: built.bytes };
  });

export const rollbackDeployment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ deploymentId: str(asRecord(input).deploymentId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: deployment } = await db
      .from("deployments")
      .select("id, project_id, snapshot")
      .eq("id", data.deploymentId)
      .maybeSingle();
    if (!deployment || !deployment.snapshot) throw new h.HttpError(404, "That deployment has no snapshot to restore.");
    const { project } = await h.loadProjectFor(user, deployment.project_id, "editor");
    const snapshot = deployment.snapshot as { pages?: unknown; theme?: unknown };
    await db
      .from("projects")
      .update({ pages: (snapshot.pages ?? project.pages) as never, theme: (snapshot.theme ?? project.theme) as never })
      .eq("id", project.id);
    await h.logActivity({ workspaceId: project.workspace_id, projectId: project.id, user, action: "rolled back a deployment", target: project.name });
    return { ok: true };
  });

export const exportProject = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ projectId: str(asRecord(input).projectId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "developer");
    const pub = await import("./publish.server");
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const origin = new URL(getRequestUrl()).origin;
    const built = pub.buildPublishedFiles(pub.rowToProject(project as never), origin);
    return { files: Object.entries(built.map).map(([path, content]) => ({ path, content })) };
  });

/* ------------------------------------------------------------------ */
/* CMS                                                                 */
/* ------------------------------------------------------------------ */

export const listCollections = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ projectId: str(asRecord(input).projectId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "viewer");
    const db = await h.admin();
    const { data: collections } = await db
      .from("collections")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at");
    const { data: items } = await db
      .from("collection_items")
      .select("*")
      .eq("project_id", project.id)
      .order("updated_at", { ascending: false });
    return { collections: collections ?? [], items: items ?? [] };
  });

export const upsertCollection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return {
      id: typeof r.id === "string" ? r.id : undefined,
      projectId: str(r.projectId),
      name: str(r.name, "Untitled collection"),
      fields: Array.isArray(r.fields) ? r.fields : [],
    };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "editor");
    const db = await h.admin();
    if (data.id) {
      const { error } = await db
        .from("collections")
        .update({ name: data.name, fields: data.fields as never })
        .eq("id", data.id)
        .eq("project_id", project.id);
      if (error) throw new h.HttpError(500, error.message);
      return { id: data.id };
    }
    const { data: row, error } = await db
      .from("collections")
      .insert({
        project_id: project.id,
        name: data.name,
        slug: `${h.slugify(data.name)}-${Math.random().toString(36).slice(2, 5)}`,
        fields: data.fields as never,
      } as never)
      .select("id")
      .single();
    if (error) throw new h.HttpError(500, error.message);
    await h.logActivity({ workspaceId: project.workspace_id, projectId: project.id, user, action: "created a collection", target: data.name });
    return { id: row.id as string };
  });

export const deleteCollection = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ id: str(asRecord(input).id) }) as Id)
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: row } = await db.from("collections").select("id, project_id").eq("id", data.id).maybeSingle();
    if (!row) throw new h.HttpError(404, "Collection not found.");
    await h.loadProjectFor(user, row.project_id, "editor");
    await db.from("collections").delete().eq("id", data.id);
    return { ok: true };
  });

export const upsertCollectionItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return {
      id: typeof r.id === "string" ? r.id : undefined,
      collectionId: str(r.collectionId),
      slug: str(r.slug),
      status: str(r.status, "draft"),
      data: asRecord(r.data),
      publishAt: typeof r.publishAt === "string" && r.publishAt ? r.publishAt : null,
    };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: collection } = await db
      .from("collections")
      .select("id, project_id")
      .eq("id", data.collectionId)
      .maybeSingle();
    if (!collection) throw new h.HttpError(404, "Collection not found.");
    await h.loadProjectFor(user, collection.project_id, "editor");
    const payload = {
      collection_id: collection.id,
      project_id: collection.project_id,
      slug: data.slug || h.slugify(str(data.data.title, "entry")),
      status: data.status,
      data: data.data as never,
      publish_at: data.publishAt,
    };
    if (data.id) {
      const { error } = await db.from("collection_items").update(payload as never).eq("id", data.id);
      if (error) throw new h.HttpError(500, error.message);
      return { id: data.id };
    }
    const { data: row, error } = await db.from("collection_items").insert(payload as never).select("id").single();
    if (error) throw new h.HttpError(500, error.message);
    return { id: row.id as string };
  });

export const deleteCollectionItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ id: str(asRecord(input).id) }) as Id)
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: row } = await db.from("collection_items").select("id, project_id").eq("id", data.id).maybeSingle();
    if (!row) throw new h.HttpError(404, "Entry not found.");
    await h.loadProjectFor(user, row.project_id, "editor");
    await db.from("collection_items").delete().eq("id", data.id);
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Assets                                                             */
/* ------------------------------------------------------------------ */

export const listAssets = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ workspaceId: str(asRecord(input).workspaceId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "viewer");
    const db = await h.admin();
    const { data: rows } = await db
      .from("assets")
      .select("*")
      .eq("workspace_id", data.workspaceId)
      .order("created_at", { ascending: false });
    return rows ?? [];
  });

export const uploadAsset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return {
      workspaceId: str(r.workspaceId),
      name: str(r.name, "file"),
      folder: str(r.folder, "/"),
      contentType: str(r.contentType, "application/octet-stream"),
      base64: str(r.base64),
    };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "editor");
    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.byteLength > 15 * 1024 * 1024) throw new h.HttpError(400, "Files must be 15 MB or smaller.");
    const db = await h.admin();
    const safe = data.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `${data.workspaceId}/${Date.now().toString(36)}-${safe}`;
    const { error: upErr } = await db.storage
      .from("assets")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (upErr) throw new h.HttpError(500, upErr.message);
    const { data: row, error } = await db
      .from("assets")
      .insert({
        workspace_id: data.workspaceId,
        name: data.name,
        folder: data.folder,
        storage_path: path,
        url: `/api/public/asset/${encodeURIComponent(path)}`,
        size: bytes.byteLength,
        content_type: data.contentType,
        uploaded_by: user.userId,
      } as never)
      .select("*")
      .single();
    if (error) throw new h.HttpError(500, error.message);
    await h.logActivity({ workspaceId: data.workspaceId, user, action: "uploaded an asset", target: data.name });
    return row;
  });

export const updateAsset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return {
      id: str(r.id),
      folder: typeof r.folder === "string" ? r.folder : undefined,
      tags: Array.isArray(r.tags) ? r.tags.map((t) => String(t)) : undefined,
      name: typeof r.name === "string" ? r.name : undefined,
    };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: row } = await db.from("assets").select("id, workspace_id").eq("id", data.id).maybeSingle();
    if (!row) throw new h.HttpError(404, "Asset not found.");
    await h.assertWorkspaceRole(user, row.workspace_id, "editor");
    const patch: Record<string, unknown> = {};
    if (data.folder !== undefined) patch.folder = data.folder;
    if (data.tags !== undefined) patch.tags = data.tags;
    if (data.name !== undefined) patch.name = data.name;
    await db.from("assets").update(patch as never).eq("id", data.id);
    return { ok: true };
  });

export const deleteAsset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ id: str(asRecord(input).id) }) as Id)
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: row } = await db.from("assets").select("id, workspace_id, storage_path").eq("id", data.id).maybeSingle();
    if (!row) throw new h.HttpError(404, "Asset not found.");
    await h.assertWorkspaceRole(user, row.workspace_id, "editor");
    await db.storage.from("assets").remove([row.storage_path]);
    await db.from("assets").delete().eq("id", data.id);
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Forms, analytics, SEO                                               */
/* ------------------------------------------------------------------ */

export const listSubmissions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ projectId: str(asRecord(input).projectId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "viewer");
    const db = await h.admin();
    const { data: rows } = await db
      .from("form_submissions")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .limit(200);
    return rows ?? [];
  });

export const updateSubmission = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return { id: str(r.id), read: typeof r.read === "boolean" ? r.read : undefined, spam: typeof r.spam === "boolean" ? r.spam : undefined, remove: r.remove === true };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const db = await h.admin();
    const { data: row } = await db.from("form_submissions").select("id, project_id").eq("id", data.id).maybeSingle();
    if (!row) throw new h.HttpError(404, "Submission not found.");
    await h.loadProjectFor(user, row.project_id, "editor");
    if (data.remove) {
      await db.from("form_submissions").delete().eq("id", data.id);
      return { ok: true };
    }
    const patch: Record<string, unknown> = {};
    if (data.read !== undefined) patch.read = data.read;
    if (data.spam !== undefined) patch.spam = data.spam;
    await db.from("form_submissions").update(patch as never).eq("id", data.id);
    return { ok: true };
  });

export const getAnalytics = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const r = asRecord(input);
    return { workspaceId: str(r.workspaceId), projectId: typeof r.projectId === "string" ? r.projectId : null };
  })
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    await h.assertWorkspaceRole(user, data.workspaceId, "viewer");
    const db = await h.admin();
    const { data: projects } = await db.from("projects").select("id, name").eq("workspace_id", data.workspaceId);
    const ids = (projects ?? []).map((p) => p.id);
    const scoped = data.projectId ? ids.filter((id) => id === data.projectId) : ids;
    if (!scoped.length) {
      return { totalViews: 0, uniqueVisitors: 0, submissions: 0, daily: [], topPages: [], sources: [], devices: [], perProject: [] };
    }
    const since = new Date(Date.now() - 29 * 864e5).toISOString();
    const { data: views } = await db
      .from("page_views")
      .select("project_id, path, referrer, session_id, device, created_at")
      .in("project_id", scoped)
      .gte("created_at", since)
      .limit(10000);
    const { count: submissions } = await db
      .from("form_submissions")
      .select("id", { count: "exact", head: true })
      .in("project_id", scoped);

    const rows = views ?? [];
    const bucket = (key: string, map: Map<string, number>) => map.set(key, (map.get(key) ?? 0) + 1);
    const daily = new Map<string, number>();
    const pages = new Map<string, number>();
    const sources = new Map<string, number>();
    const devices = new Map<string, number>();
    const perProject = new Map<string, number>();
    const sessions = new Set<string>();
    for (let i = 29; i >= 0; i--) daily.set(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), 0);
    for (const row of rows) {
      const day = String(row.created_at).slice(0, 10);
      if (daily.has(day)) daily.set(day, (daily.get(day) ?? 0) + 1);
      bucket(row.path || "/", pages);
      let source = "Direct";
      if (row.referrer) {
        try {
          source = new URL(row.referrer).hostname.replace(/^www\./, "");
        } catch {
          source = "Other";
        }
      }
      bucket(source, sources);
      bucket(row.device || "desktop", devices);
      bucket(row.project_id, perProject);
      if (row.session_id) sessions.add(row.session_id);
    }
    const top = (map: Map<string, number>, limit = 6) =>
      [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, value]) => ({ label, value }));
    return {
      totalViews: rows.length,
      uniqueVisitors: sessions.size,
      submissions: submissions ?? 0,
      daily: [...daily.entries()].map(([label, value]) => ({ label, value })),
      topPages: top(pages),
      sources: top(sources),
      devices: top(devices),
      perProject: (projects ?? [])
        .filter((p) => scoped.includes(p.id))
        .map((p) => ({ id: p.id, name: p.name, views: perProject.get(p.id) ?? 0 }))
        .sort((a, b) => b.views - a.views),
    };
  });

export const getSeoReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({ projectId: str(asRecord(input).projectId) }))
  .handler(async ({ data }) => {
    const h = await import("./db.server");
    const user = await h.requireUser();
    const { project } = await h.loadProjectFor(user, data.projectId, "viewer");
    const pages = (project.pages as Array<{ id: string; name: string; slug: string; seo: { title: string; description: string }; nodes: Array<{ type: string; props: Record<string, unknown> }> }>) ?? [];
    const report = pages.map((page) => {
      const issues: { level: "error" | "warn"; message: string }[] = [];
      const title = page.seo?.title ?? "";
      const description = page.seo?.description ?? "";
      if (!title) issues.push({ level: "error", message: "Missing page title" });
      else if (title.length > 60) issues.push({ level: "warn", message: `Title is ${title.length} characters (aim for under 60)` });
      if (!description) issues.push({ level: "error", message: "Missing meta description" });
      else if (description.length > 160) issues.push({ level: "warn", message: `Description is ${description.length} characters (aim for under 160)` });
      const headings = page.nodes.filter((n) => n.type === "heading" || n.type === "hero");
      if (!headings.length) issues.push({ level: "error", message: "No H1 heading on the page" });
      if (headings.length > 1) issues.push({ level: "warn", message: "More than one hero/H1 block — keep a single H1" });
      const images = page.nodes.filter((n) => n.type === "image" || n.type === "gallery");
      const missingAlt = images.filter((n) => !String(n.props?.alt ?? "").trim()).length;
      if (missingAlt) issues.push({ level: "warn", message: `${missingAlt} image block(s) missing alt text` });
      const score = Math.max(
        20,
        100 - issues.reduce((n, i) => n + (i.level === "error" ? 22 : 8), 0),
      );
      return { id: page.id, name: page.name, slug: page.slug, title, description, issues, score };
    });
    const average = report.length ? Math.round(report.reduce((n, p) => n + p.score, 0) / report.length) : 0;
    return { average, pages: report, sitemap: `https://${project.domain}/sitemap.xml` };
  });
