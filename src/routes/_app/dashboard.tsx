import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useUser, useOrganizationList } from "@clerk/tanstack-react-start";
import { ArrowUpRight, CheckCircle2, Circle, PencilRuler, Plus, Rocket, Users } from "lucide-react";
import { readOnboarding } from "@/lib/onboarding";
import { listProjects } from "@/lib/api.functions";
import { useWorkspace } from "@/lib/use-workspace";


export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — RetailX" },
      { name: "description", content: "Your RetailX workspace: projects, team activity and publishing." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useUser();
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const onboarding = readOnboarding(user);
  const orgCount = isLoaded ? (userMemberships?.data?.length ?? 0) : 0;

  const { workspaceId, workspace } = useWorkspace();
  const list = useServerFn(listProjects);
  const projectsQuery = useQuery({
    queryKey: ["projects", workspaceId],
    enabled: Boolean(workspaceId),
    queryFn: () => list({ data: { workspaceId: workspaceId! } }),
  });
  const projects = projectsQuery.data ?? [];

  const recent = projects.slice(0, 5);
  const liveCount = projects.filter((p) => p.publishedAt).length;


  const steps = [
    { label: "Create your account", done: true },
    { label: "Name your workspace", done: Boolean(onboarding.workspaceName) },
    { label: "Pick a starting template", done: Boolean(onboarding.template) },
    { label: "Set your brand colour", done: Boolean(onboarding.brandColor && onboarding.completed) },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Welcome back</p>
          <h1 className="font-display mt-1 text-4xl font-bold tracking-tight md:text-5xl">
            {user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "Creator"}
          </h1>
        </div>
        <Link
          to="/projects"
          className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold shadow-[var(--shadow-glow)] transition hover:brightness-110"
        >
          <Plus className="size-4" />
          New project
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat
          label="Workspace"
          value={workspace?.name || onboarding.workspaceName || "Not set"}
          hint={workspace?.plan ? `${workspace.plan} plan` : "Personal"}
        />
        <Stat label="Sites" value={String(projects.length)} hint={`${liveCount} live`} />
        <Stat label="Live sites" value={String(liveCount)} hint="Published" />
        <Stat label="Organizations" value={String(orgCount)} hint="Team workspaces" />
      </div>
      <div className="mt-4">
        <Stat
          label="Setup"
          value={`${doneCount}/${steps.length}`}
          hint={onboarding.completed ? "Complete" : "In progress"}
        />
      </div>


      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="glass rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold tracking-tight">Get to your first publish</h2>
          <ul className="mt-5 space-y-3">
            {steps.map((step) => (
              <li key={step.label} className="flex items-center gap-3 text-sm">
                {step.done ? (
                  <CheckCircle2 className="text-primary size-5 shrink-0" />
                ) : (
                  <Circle className="text-muted-foreground size-5 shrink-0" />
                )}
                <span className={step.done ? "text-muted-foreground line-through" : ""}>
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
          {!onboarding.completed && (
            <Link
              to="/onboarding"
              className="text-primary mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              Continue setup <ArrowUpRight className="size-4" />
            </Link>
          )}
        </section>

        <section className="glass rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold tracking-tight">Quick actions</h2>
          <div className="mt-5 grid gap-2">
            <QuickAction to="/team" icon={Users} label="Invite your team" />
            <QuickAction to="/templates" icon={Rocket} label="Browse templates" />
            <QuickAction to="/settings" icon={Plus} label="Account settings" />
          </div>
          <div className="border-border text-muted-foreground mt-6 border-t pt-4 text-xs">
            Signed in as {user?.primaryEmailAddress?.emailAddress}
            {user?.lastSignInAt && (
              <> · last sign-in {new Date(user.lastSignInAt).toLocaleDateString()}</>
            )}
          </div>
        </section>
      </div>

      <section className="glass mt-6 rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight">Recent projects</h2>
          <Link to="/projects" className="text-primary text-sm font-semibold">
            All projects
          </Link>
        </div>
        {recent.length ? (
          <ul className="mt-4 grid gap-2">
            {recent.map((p) => (
              <li key={p.id} className="hover:bg-secondary/50 flex flex-wrap items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors">
                <PencilRuler className="text-primary size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                <span className="text-muted-foreground text-xs">
                  {p.pageCount} page{p.pageCount === 1 ? "" : "s"} ·{" "}
                  {p.publishedAt ? "Live" : "Draft"} · {new Date(p.updatedAt).toLocaleDateString()}
                </span>
                <Link
                  to="/editor/$projectId"
                  params={{ projectId: p.id }}
                  className="border-border text-muted-foreground hover:text-foreground rounded-full border px-3 py-1.5 text-xs"
                >
                  Open editor
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            No sites yet —{" "}
            <Link to="/projects" className="text-primary">
              create your first project
            </Link>
            .
          </p>
        )}
      </section>

    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">{label}</p>
      <p className="font-display mt-2 truncate text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="hover:bg-secondary/60 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors"
    >
      <Icon className="text-primary size-4" />
      {label}
    </Link>
  );
}
