/**
 * Clerk configuration.
 *
 * The publishable key is public by design (it ships in the browser bundle),
 * so it lives in source. The secret key is server-only and is read from
 * `process.env.CLERK_SECRET_KEY` inside server middleware.
 */
export const CLERK_PUBLISHABLE_KEY =
  "pk_test_bWFueS1zaGVlcC00NC5jbGVyay5hY2NvdW50cy5kZXYk";

/** Clerk appearance tuned to the RetailX dark editorial design system. */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#c2f24a",
    colorBackground: "#181c22",
    colorText: "#f3f5f7",
    colorTextSecondary: "#a5adb8",
    colorInputBackground: "#232830",
    colorInputText: "#f3f5f7",
    colorNeutral: "#ffffff",
    colorDanger: "#f4603e",
    colorSuccess: "#c2f24a",
    borderRadius: "0.9rem",
    fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-[var(--shadow-lift)] rounded-3xl border border-border",
    card: "bg-card/80 backdrop-blur-xl",
    headerTitle: "font-display tracking-tight",
    formButtonPrimary:
      "rounded-full font-semibold normal-case tracking-tight hover:brightness-110",
    socialButtonsBlockButton: "rounded-full border-border",
    footerActionLink: "text-primary hover:text-primary",
    userButtonPopoverCard: "rounded-2xl border border-border",
  },
} as const;
