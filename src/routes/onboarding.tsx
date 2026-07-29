import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useAuth, useUser, ClerkLoaded, ClerkLoading } from "@clerk/tanstack-react-start";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import {
  BRAND_COLORS,
  GOALS,
  ONBOARDING_TEMPLATES,
  readOnboarding,
  saveOnboarding,
  type OnboardingState,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set up your workspace — RetailX" },
      {
        name: "description",
        content: "Name your workspace, pick a template and brand it — then publish your first site.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingRoute,
});

function OnboardingRoute() {
  return (
    <>
      <ClerkLoading>
        <div className="grid min-h-screen place-items-center">
          <Loader2 className="text-primary size-6 animate-spin" />
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <Gate />
      </ClerkLoaded>
    </>
  );
}

function Gate() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return <Navigate to="/sign-in" search={{ redirect_url: typeof window !== "undefined" ? window.location.pathname : "/" }} replace />;
  }
  return <Wizard />;
}

const STEPS = ["Workspace", "Goal", "Template", "Brand"] as const;

function Wizard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState>(() => {
    const existing = readOnboarding(user);
    return {
      ...existing,
      workspaceName: existing.workspaceName || (user?.firstName ? `${user.firstName}'s Studio` : ""),
    };
  });

  const canAdvance =
    (step === 0 && state.workspaceName.trim().length > 1) ||
    (step === 1 && Boolean(state.goal)) ||
    (step === 2 && Boolean(state.template)) ||
    step === 3;

  async function finish() {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await saveOnboarding(user, {
        ...state,
        workspaceName: state.workspaceName.trim(),
        completed: true,
        completedAt: new Date().toISOString(),
      });
      await navigate({ to: "/dashboard" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your workspace. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-16">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-secondary",
              )}
            />
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-xs tracking-widest uppercase">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      <div className="glass animate-pop mt-4 rounded-3xl p-6 md:p-8" key={step}>
        {step === 0 && (
          <>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Name your workspace
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              This is where your projects, assets and team live.
            </p>
            <input
              autoFocus
              value={state.workspaceName}
              onChange={(e) => setState((s) => ({ ...s, workspaceName: e.target.value }))}
              placeholder="Studio Nova"
              className="border-input bg-secondary/40 focus:ring-ring mt-6 w-full rounded-2xl border px-4 py-3.5 text-base outline-none focus:ring-2"
            />
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              What are you building?
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              We'll tailor templates and starter sections to match.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, goal }))}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left text-sm transition-all",
                    state.goal === goal
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary/50",
                  )}
                >
                  {goal}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Pick a starting template
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Every template is fully editable on the canvas.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {ONBOARDING_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, template: tpl.id }))}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all",
                    state.template === tpl.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary/50",
                  )}
                >
                  <p className="font-semibold">{tpl.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{tpl.blurb}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Choose your brand accent
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Applied to buttons, links and highlights across your site.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {BRAND_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={color.label}
                  onClick={() => setState((s) => ({ ...s, brandColor: color.value }))}
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl border-2 transition-transform hover:scale-105",
                    state.brandColor === color.value ? "border-foreground" : "border-transparent",
                  )}
                  style={{ backgroundColor: color.value }}
                >
                  {state.brandColor === color.value && (
                    <Check className="size-5 text-black/70" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
            <div className="border-border mt-8 rounded-2xl border border-dashed p-4 text-sm">
              <p className="text-muted-foreground">You're setting up</p>
              <p className="font-display mt-1 text-lg font-bold">{state.workspaceName}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {state.goal} ·{" "}
                {ONBOARDING_TEMPLATES.find((t) => t.id === state.template)?.name ?? "No template"}
              </p>
            </div>
          </>
        )}

        {error && <p className="text-destructive mt-4 text-sm">{error}</p>}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || saving}
            className="text-muted-foreground hover:text-foreground inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Finish setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
