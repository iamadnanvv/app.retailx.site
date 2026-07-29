import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/sign-up/$")({
  head: () => ({
    meta: [
      { title: "Create your account — RetailX" },
      {
        name: "description",
        content: "Create a free RetailX account and publish your first ultra-fast website in minutes.",
      },
      { property: "og:title", content: "Create your account — RetailX" },
      {
        property: "og:description",
        content: "Create a free RetailX account and publish your first ultra-fast website in minutes.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight">Start building free</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            No credit card. Publish your first site today.
          </p>
        </div>
        <SignUp
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/onboarding"
          fallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
