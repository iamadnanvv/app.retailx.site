import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Reveal } from "@/components/site/reveal";
import { plans } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "RetailX Pricing — Free, Pro, Business and Enterprise" },
      {
        name: "description",
        content:
          "Start free forever. Upgrade for custom domains, CMS collections, AI generation, team roles, audit logs and enterprise governance.",
      },
      { property: "og:title", content: "RetailX Pricing" },
      {
        property: "og:description",
        content: "Transparent plans for creators, freelancers, agencies and enterprise teams.",
      },
      { name: "twitter:title", content: "RetailX Pricing" },
      { name: "twitter:description", content: "Free forever plan, then $24/editor for Pro." },
    ],
  }),
  component: Pricing,
});

const faqs = [
  {
    q: "What counts as an editor?",
    a: "Anyone with Owner, Admin, Editor or Developer permissions in a workspace. Viewers are always free and unlimited.",
  },
  {
    q: "Can I export the static build?",
    a: "Yes. Pro and above can download the full static output — HTML, CSS, JS and optimized assets — and host it anywhere.",
  },
  {
    q: "Do you offer an annual discount?",
    a: "Annual billing saves two months on every paid plan, and Enterprise agreements are always annual.",
  },
  {
    q: "How do trials work?",
    a: "Every paid plan includes a 14-day trial with full feature access. No card required to start.",
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="px-6 pb-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="eyebrow">Pricing</p>
          <h1 className="display-lg mx-auto mt-4 max-w-3xl">
            Pay for <span className="text-gradient">craft</span>, not for seats you don't use
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl leading-relaxed">
            Build and publish for free. Scale when your team, traffic or client roster does.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-10 flex justify-center">
          <div className="glass inline-flex items-center gap-1 rounded-full p-1">
            {[
              { label: "Monthly", value: false },
              { label: "Annual · save 2 months", value: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setAnnual(option.value)}
                aria-pressed={annual === option.value}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-all duration-200",
                  annual === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {plans.map((plan, i) => {
            const numeric = Number(plan.price.replace("$", ""));
            const price = Number.isNaN(numeric)
              ? plan.price
              : annual && numeric > 0
                ? `$${Math.round(numeric * 10) / 12 === 0 ? numeric : Math.round((numeric * 10) / 12)}`
                : plan.price;

            return (
              <Reveal key={plan.name} delay={i * 70}>
                <article
                  className={cn(
                    "flex h-full flex-col rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1",
                    plan.featured
                      ? "bg-secondary/60 border-primary/50 shadow-[var(--shadow-glow)] border"
                      : "glass",
                  )}
                >
                  {plan.featured && (
                    <span className="bg-primary text-primary-foreground mb-4 w-fit rounded-full px-3 py-1 text-[0.65rem] font-semibold tracking-wide uppercase">
                      Most popular
                    </span>
                  )}
                  <h2 className="font-display text-xl font-semibold">{plan.name}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">{plan.tagline}</p>
                  <p className="display-md mt-6">{price}</p>
                  <p className="text-muted-foreground text-xs">
                    {annual && plan.price !== "$0" && plan.price !== "Custom"
                      ? "per editor / month, billed annually"
                      : plan.cadence}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="text-primary mt-0.5 size-4 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex-1 pt-8" />
                  <MagneticButton
                    variant={plan.featured ? "primary" : "glass"}
                    size="sm"
                    to="/docs"
                    className="w-full"
                  >
                    {plan.price === "Custom" ? "Talk to sales" : "Get started"}
                  </MagneticButton>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mx-auto mt-28 max-w-3xl">
          <Reveal>
            <h2 className="display-md text-center">Questions, answered</h2>
          </Reveal>
          <div className="mt-8 space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 60}>
                <div className="glass overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="hover:bg-secondary/40 flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                  >
                    <span className="font-display font-medium">{faq.q}</span>
                    <span
                      className={cn(
                        "text-primary text-xl transition-transform duration-300",
                        openFaq === i && "rotate-45",
                      )}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="text-muted-foreground animate-pop px-6 pb-6 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
