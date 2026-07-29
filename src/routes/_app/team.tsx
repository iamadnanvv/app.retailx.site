import { createFileRoute } from "@tanstack/react-router";
import {
  OrganizationProfile,
  OrganizationList,
  OrganizationSwitcher,
  useOrganization,
} from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/_app/team")({
  head: () => ({
    meta: [
      { title: "Team & workspaces — RetailX" },
      {
        name: "description",
        content: "Create organization workspaces, invite teammates and manage roles in RetailX.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeamPage,
});

const ROLES = [
  { name: "Owner", blurb: "Full control including billing and deletion." },
  { name: "Admin", blurb: "Manage members, domains and publishing settings." },
  { name: "Editor", blurb: "Design pages, edit content and request publishes." },
  { name: "Developer", blurb: "Custom code, environment variables and integrations." },
  { name: "Viewer", blurb: "Read-only access to projects and analytics." },
];

function TeamPage() {
  const { organization, isLoaded } = useOrganization();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Organization workspaces, invitations and member roles.
          </p>
        </div>
        <OrganizationSwitcher hidePersonal={false} />
      </div>

      <div className="mt-8">
        {!isLoaded ? (
          <div className="glass grid h-48 place-items-center rounded-3xl">
            <div className="border-primary/30 border-t-primary size-6 animate-spin rounded-full border-2" />
          </div>
        ) : organization ? (
          <OrganizationProfile routing="hash" />
        ) : (
          <div className="glass rounded-3xl p-6">
            <h2 className="font-display text-xl font-bold tracking-tight">
              Create a team workspace
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Team workspaces let you share projects, invite teammates and assign roles.
            </p>
            <div className="mt-6">
              <OrganizationList hidePersonal={false} />
            </div>
          </div>
        )}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold tracking-tight">Role permissions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {ROLES.map((role) => (
            <div key={role.name} className="glass rounded-2xl p-4">
              <p className="font-semibold">{role.name}</p>
              <p className="text-muted-foreground mt-1 text-sm">{role.blurb}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-4 text-xs">
          Roles beyond Owner/Admin/Member are configured in your Clerk dashboard under
          Organizations → Roles, then assigned to members here.
        </p>
      </section>
    </div>
  );
}
