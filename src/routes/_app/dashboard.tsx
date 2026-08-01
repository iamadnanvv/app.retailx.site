import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useUser, useOrganizationList } from "@clerk/tanstack-react-start";
import { ArrowUpRight, CheckCircle2, Circle, PencilRuler, Plus, Rocket, Users } from "lucide-react";
import { readOnboarding } from "@/lib/onboarding";
import { loadProjects } from "@/lib/builder/storage";
import type { BuilderProject } from "@/lib/builder/types";


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
          to="/onboarding"
          className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold shadow-[var(--shadow-glow)] transition hover:brightness-110"
        >
          <Plus className="size-4" />
          New project
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat label="Workspace" value={onboarding.workspaceName || "Not set"} hint="Personal" />
        <Stat label="Organizations" value={String(orgCount)} hint="Team workspaces" />
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
