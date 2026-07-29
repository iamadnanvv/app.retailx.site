import { createFileRoute } from "@tanstack/react-router";
import { UserProfile } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Account settings — RetailX" },
      { name: "description", content: "Manage your RetailX profile, security and connected accounts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl font-bold tracking-tight">Account settings</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Profile, email addresses, password, connected accounts, multi-factor and active sessions.
      </p>
      <div className="mt-8">
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
