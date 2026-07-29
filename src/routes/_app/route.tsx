import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SignedIn, SignedOut, RedirectToSignIn, ClerkLoaded, ClerkLoading } from "@clerk/tanstack-react-start";
import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/_app")({
  // Clerk resolves the session in the browser, so skip SSR for the whole
  // protected subtree to avoid signed-in users flashing the sign-in redirect.
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <ClerkLoading>
        <div className="grid min-h-screen place-items-center">
          <div className="border-primary/30 border-t-primary size-8 animate-spin rounded-full border-2" />
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <AppShell>
            <Outlet />
          </AppShell>
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </ClerkLoaded>
    </>
  );
}
