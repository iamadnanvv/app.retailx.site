import type { UserResource } from "@clerk/types";

export interface OnboardingState {
  completed: boolean;
  workspaceName: string;
  template: string;
  brandColor: string;
  goal: string;
  completedAt?: string;
}

export const BRAND_COLORS = [
  { label: "Lime", value: "#c2f24a" },
  { label: "Cyan", value: "#4ad4f2" },
  { label: "Ember", value: "#f4813e" },
  { label: "Violet", value: "#a78bfa" },
  { label: "Rose", value: "#fb7185" },
] as const;

export const ONBOARDING_TEMPLATES = [
  { id: "saas-launch", name: "SaaS Launch", blurb: "Hero, pricing, FAQ, changelog" },
  { id: "agency-studio", name: "Agency Studio", blurb: "Case studies, team, contact" },
  { id: "personal-portfolio", name: "Portfolio", blurb: "Work grid, about, journal" },
  { id: "ecommerce-drop", name: "Ecommerce Drop", blurb: "Product hero, gallery, checkout CTA" },
] as const;

export const GOALS = [
  "Launch a product",
  "Client websites",
  "Personal portfolio",
  "Marketing campaigns",
] as const;

const EMPTY: OnboardingState = {
  completed: false,
  workspaceName: "",
  template: "",
  brandColor: BRAND_COLORS[0].value,
  goal: "",
};

export function readOnboarding(user: UserResource | null | undefined): OnboardingState {
  const raw = (user?.unsafeMetadata?.onboarding ?? {}) as Partial<OnboardingState>;
  return { ...EMPTY, ...raw };
}

export async function saveOnboarding(user: UserResource, next: OnboardingState) {
  await user.update({
    unsafeMetadata: { ...user.unsafeMetadata, onboarding: next },
  });
}
