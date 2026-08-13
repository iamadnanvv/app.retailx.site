import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ClerkLoaded, UserButton, useAuth } from "@clerk/tanstack-react-start";
import { MagneticButton } from "@/components/site/magnetic-button";
import { BrandMark } from "@/components/site/brand-mark";
import { cn } from "@/lib/utils";


const nav = [
  { label: "Product", to: "/" },
  { label: "Templates", to: "/templates" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "Pricing", to: "/pricing" },
  { label: "Docs", to: "/docs" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isSignedIn } = useAuth();


  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500",
          scrolled ? "glass shadow-[var(--shadow-card)]" : "border-transparent bg-transparent",
        )}
      >
        <Link to="/" className="flex items-center gap-2 pl-2">
          <BrandMark size={30} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-full px-4 py-2 text-sm transition-colors"
              activeProps={{ className: "text-foreground bg-secondary/60" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ClerkLoaded>
            {isSignedIn ? (
              <>
                <MagneticButton variant="glass" size="sm" to="/dashboard">
                  Dashboard
                </MagneticButton>
                <UserButton />
              </>
            ) : (
              <>
                <MagneticButton variant="ghost" size="sm" href="/sign-in">
                  Sign in
                </MagneticButton>
                <MagneticButton size="sm" href="/sign-up">
                  Start free
                </MagneticButton>
              </>
            )}
          </ClerkLoaded>
        </div>


        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="hover:bg-secondary/60 grid size-10 place-items-center rounded-full transition-colors md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="glass animate-pop mx-auto mt-2 max-w-6xl rounded-3xl p-3 md:hidden">
          <nav className="flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="hover:bg-secondary/60 rounded-2xl px-4 py-3 text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-2 grid gap-2 px-1 pb-1">
            <MagneticButton href={isSignedIn ? "/dashboard" : "/sign-up"} className="w-full">
              {isSignedIn ? "Go to dashboard" : "Start free"}
            </MagneticButton>

          </div>
        </div>
      )}
    </header>
  );
}
