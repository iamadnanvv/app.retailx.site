export interface Template {
  name: string;
  category: string;
  blurb: string;
  seo: number;
  a11y: number;
  perf: number;
  cms: boolean;
  accent: "primary" | "accent" | "ember";
}

export const templateCategories = [
  "All",
  "SaaS",
  "Agency",
  "Ecommerce",
  "Portfolio",
  "AI Startup",
  "Restaurant",
  "Real Estate",
  "Education",
  "Nonprofit",
] as const;

export const templates: Template[] = [
  {
    name: "Nova SaaS",
    category: "SaaS",
    blurb: "Conversion-first product launch with pricing matrix and changelog CMS.",
    seo: 99,
    a11y: 98,
    perf: 100,
    cms: true,
    accent: "primary",
  },
  {
    name: "Studio Kern",
    category: "Agency",
    blurb: "Editorial agency site with case-study collections and scroll storytelling.",
    seo: 97,
    a11y: 96,
    perf: 99,
    cms: true,
    accent: "accent",
  },
  {
    name: "Drop Culture",
    category: "Ecommerce",
    blurb: "Streetwear drops, countdown timers and lookbook galleries.",
    seo: 96,
    a11y: 94,
    perf: 98,
    cms: true,
    accent: "ember",
  },
  {
    name: "Monolith",
    category: "Portfolio",
    blurb: "Oversized type portfolio with magnetic cursor and project reels.",
    seo: 98,
    a11y: 97,
    perf: 100,
    cms: false,
    accent: "primary",
  },
  {
    name: "Synapse AI",
    category: "AI Startup",
    blurb: "Model launch page with animated architecture diagram and waitlist forms.",
    seo: 99,
    a11y: 95,
    perf: 99,
    cms: true,
    accent: "accent",
  },
  {
    name: "Ember Table",
    category: "Restaurant",
    blurb: "Menu collections, reservation flow and seasonal hero video.",
    seo: 95,
    a11y: 96,
    perf: 98,
    cms: true,
    accent: "ember",
  },
  {
    name: "Northside",
    category: "Real Estate",
    blurb: "Listing CMS, map blocks and mortgage calculator interactions.",
    seo: 97,
    a11y: 95,
    perf: 97,
    cms: true,
    accent: "primary",
  },
  {
    name: "Atlas Learn",
    category: "Education",
    blurb: "Course catalog, lesson pages and instructor directory.",
    seo: 96,
    a11y: 99,
    perf: 98,
    cms: true,
    accent: "accent",
  },
  {
    name: "Common Good",
    category: "Nonprofit",
    blurb: "Donation blocks, impact statistics and volunteer signup forms.",
    seo: 98,
    a11y: 99,
    perf: 99,
    cms: true,
    accent: "ember",
  },
];

export const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Ship your first idea today.",
    featured: false,
    features: [
      "1 workspace, 2 projects",
      "retailx.site subdomain",
      "Full visual builder",
      "Community templates",
      "Basic analytics",
    ],
  },
  {
    name: "Pro",
    price: "$24",
    cadence: "per editor / month",
    tagline: "For freelancers going pro.",
    featured: true,
    features: [
      "Unlimited projects",
      "Custom domains + SSL",
      "CMS collections & drafts",
      "Animation & interaction builder",
      "AI copy and section generation",
      "Version history (90 days)",
    ],
  },
  {
    name: "Business",
    price: "$79",
    cadence: "per editor / month",
    tagline: "For teams and agencies.",
    featured: false,
    features: [
      "Roles & granular permissions",
      "Client review workflows",
      "Staging + preview deployments",
      "Form webhooks & CRM sync",
      "Audit logs and backups",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual",
    tagline: "Governance at scale.",
    featured: false,
    features: [
      "SSO & SCIM provisioning",
      "Dedicated edge regions",
      "Custom SLAs and support",
      "Security review & DPA",
      "Private marketplace",
    ],
  },
];

export const marketplaceItems = [
  {
    name: "Kinetic Type Pack",
    kind: "Animation library",
    price: "$29",
    detail: "38 spring-based text reveals with staggered mask transitions.",
  },
  {
    name: "Commerce Kit",
    kind: "UI kit",
    price: "$79",
    detail: "Cart drawers, product grids, filters and checkout sections.",
  },
  {
    name: "Lucide Pro Icons",
    kind: "Icon pack",
    price: "Free",
    detail: "1,400 stroke icons with variable weight tokens.",
  },
  {
    name: "Sheet Sync",
    kind: "Plugin",
    price: "$15",
    detail: "Bind CMS collections to spreadsheets with scheduled refresh.",
  },
  {
    name: "Core Vitals Monitor",
    kind: "Integration",
    price: "$9",
    detail: "Field CWV data streamed into your project analytics.",
  },
  {
    name: "Glass Components",
    kind: "Component set",
    price: "$39",
    detail: "62 glassmorphism primitives with variant + theme support.",
  },
];
