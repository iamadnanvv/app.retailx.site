import { Link, useRouterState } from "@tanstack/react-router";
import { UserButton } from "@clerk/tanstack-react-start";
import { LayoutDashboard, Users, Settings, Sparkles, PencilRuler } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/site/brand-mark";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", to: "/projects", icon: PencilRuler },
  { label: "Team", to: "/team", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen">
      <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-2 rounded-none border-y-0 border-l-0 p-4 md:flex">
        <Link to="/" className="mb-4 flex items-center gap-2 px-2 py-1">
          <BrandMark size={30} />
        </Link>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-secondary/70 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/onboarding"
          className="border-border text-muted-foreground hover:text-foreground mt-auto flex items-center gap-3 rounded-2xl border border-dashed px-3 py-2.5 text-sm transition-colors"
        >
          <Sparkles className="size-4" />
          Setup guide
        </Link>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="glass sticky top-0 z-40 flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 py-3 md:px-8">
          <nav className="flex items-center gap-1 md:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-muted-foreground hover:text-foreground grid size-9 place-items-center rounded-full"
                activeProps={{ className: "text-foreground bg-secondary/60" }}
              >
                <item.icon className="size-4" />
              </Link>
            ))}
          </nav>
          <span className="font-display hidden text-sm font-semibold tracking-tight md:block">
            Workspace
          </span>
          <UserButton />
        </header>

        <div className="animate-pop px-4 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
