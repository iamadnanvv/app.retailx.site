import { createNode } from "@/lib/builder/blocks";
import { defaultTheme, uid, type BlockType, type BuilderNode, type BuilderProject } from "@/lib/builder/types";

/**
 * The RetailX landing-page library.
 *
 * Every entry is a real, buildable page recipe — not a screenshot. `buildTemplateProject`
 * turns an entry into a full `BuilderProject` that opens in the visual editor and
 * publishes as static HTML through the same pipeline as any hand-built site.
 */
export type TemplateCategory =
  | "Startup"
  | "SaaS"
  | "Agency"
  | "Ecommerce"
  | "Fashion"
  | "Restaurant"
  | "Hotel"
  | "Healthcare"
  | "Education"
  | "Architecture"
  | "Construction"
  | "Real Estate"
  | "Photography"
  | "AI Startup"
  | "Crypto"
  | "Portfolio"
  | "Landing Page"
  | "Consulting"
  | "Events"
  | "Nonprofit";

export interface LandingTemplate {
  slug: string;
  name: string;
  category: TemplateCategory;
  accent: string;
  blurb: string;
  headline: string;
  subhead: string;
  cta: string;
  features: string[];
  stats?: string[];
  faq?: string[];
  quote?: string;
  author?: string;
  role?: string;
  cms?: boolean;
  seo?: number;
  a11y?: number;
  perf?: number;
}

type Recipe = {
  sections: BlockType[];
  stats: string[];
  faq: string[];
  quote: string;
  author: string;
  role: string;
};

const marketingSections: BlockType[] = [
  "hero",
  "stats",
  "features",
  "testimonial",
  "pricing",
  "faq",
  "cta",
  "footer",
];
const visualSections: BlockType[] = [
  "hero",
  "gallery",
  "features",
  "stats",
  "testimonial",
  "cta",
  "footer",
];
const serviceSections: BlockType[] = [
  "hero",
  "features",
  "stats",
  "testimonial",
  "faq",
  "form",
  "footer",
];

const categoryRecipes: Record<TemplateCategory, Recipe> = {
  Startup: {
    sections: marketingSections,
    stats: ["$14M | Seed raised", "8k | Waitlist", "4.9/5 | Beta rating", "12 | Countries"],
    faq: [
      "When do you launch? | Private beta is open now, general access follows next quarter.",
      "Is there a free tier? | Yes — every plan starts free with no card required.",
    ],
    quote: "We went from deck to live product page in a single afternoon.",
    author: "Iris Kaufman",
    role: "Founder",
  },
  SaaS: {
    sections: marketingSections,
    stats: ["99.99% | Uptime", "2.1M | API calls / day", "600+ | Teams", "SOC 2 | Certified"],
    faq: [
      "Can I migrate my data? | Import from CSV or our API in a guided two-step flow.",
      "Do you offer SSO? | SAML and SCIM ship on the Business plan and above.",
    ],
    quote: "Onboarding time dropped by 60% after we switched.",
    author: "Devon Aliyev",
    role: "VP Operations",
  },
  Agency: {
    sections: visualSections,
    stats: ["120+ | Projects shipped", "18 | Awards", "9 yrs | In business", "32 | Specialists"],
    faq: [
      "How do engagements start? | A paid two-week discovery sprint with a fixed deliverable.",
      "Do you work retainer? | Yes, monthly retainers start at 40 hours.",
    ],
    quote: "They rebuilt our brand system and revenue followed.",
    author: "Priya Raman",
    role: "CMO",
  },
  Ecommerce: {
    sections: visualSections,
    stats: ["48h | Free delivery", "4.8/5 | 12k reviews", "60-day | Returns", "90+ | Stockists"],
    faq: [
      "What is your returns policy? | Sixty days, no questions, prepaid label included.",
      "Do you ship worldwide? | We ship to 74 countries with duties calculated at checkout.",
    ],
    quote: "Conversion lifted 22% the week the new store went live.",
    author: "Noah Whitfield",
    role: "Head of Ecommerce",
  },
  Fashion: {
    sections: visualSections,
    stats: ["SS26 | New season", "100% | Organic cotton", "24 | Ateliers", "3 | Flagships"],
    faq: [
      "How do I find my size? | Every product page carries measured garment specs.",
      "Are pieces restocked? | Core pieces restock monthly; drops are one-time runs.",
    ],
    quote: "The lookbook layout finally does the collection justice.",
    author: "Camille Duret",
    role: "Creative Director",
  },
  Restaurant: {
    sections: visualSections,
    stats: ["1 | Michelin star", "Seasonal | Menu", "Since 2011 | Family run", "80 | Covers"],
    faq: [
      "Do you take walk-ins? | The bar seats sixteen for walk-ins every evening.",
      "Can you cater dietary needs? | Share them when booking and the kitchen adapts the menu.",
    ],
    quote: "Reservations doubled after the new site launched.",
    author: "Marco Vidal",
    role: "Owner",
  },
  Hotel: {
    sections: visualSections,
    stats: ["42 | Suites", "4.9 | Guest score", "2 | Restaurants", "Spa | & thermal baths"],
    faq: [
      "What time is check-in? | From 3pm, with complimentary early luggage storage.",
      "Is parking available? | Valet parking is included with every suite booking.",
    ],
    quote: "Direct bookings overtook the OTAs within two months.",
    author: "Lena Fischer",
    role: "General Manager",
  },
  Healthcare: {
    sections: serviceSections,
    stats: ["24/7 | Care line", "38 | Specialists", "98% | Patient satisfaction", "4 | Clinics"],
    faq: [
      "Do you accept insurance? | We bill all major providers directly.",
      "How fast can I be seen? | Most appointments are available within 48 hours.",
    ],
    quote: "Patients finally find the information they need on their own.",
    author: "Dr. Amara Osei",
    role: "Clinical Director",
  },
  Education: {
    sections: serviceSections,
    stats: ["12k | Learners", "94% | Completion", "180 | Lessons", "Lifetime | Access"],
    faq: [
      "Is there a certificate? | Yes, an accredited certificate on completion.",
      "Can teams enrol together? | Cohort licences start at five seats.",
    ],
    quote: "Enrolment tripled once the curriculum page was clear.",
    author: "Tom Beckett",
    role: "Programme Lead",
  },
  Architecture: {
    sections: visualSections,
    stats: ["64 | Built works", "RIBA | Chartered", "1998 | Founded", "5 | Studios"],
    faq: [
      "Do you take residential work? | Yes, from extensions to full new-builds.",
      "How is fee structured? | A percentage of construction cost, staged by RIBA work stage.",
    ],
    quote: "The portfolio reads like a monograph and clients notice.",
    author: "Sofia Marchetti",
    role: "Principal Architect",
  },
  Construction: {
    sections: serviceSections,
    stats: ["240 | Projects delivered", "0.4 | Incident rate", "£180M | Built value", "35 yrs | Trading"],
    faq: [
      "Are you insured? | £10M public liability and full CDM compliance.",
      "How do quotes work? | Site visit, itemised quote, fixed-price contract.",
    ],
    quote: "Tender enquiries doubled after we published our case studies.",
    author: "Gareth Lloyd",
    role: "Managing Director",
  },
  "Real Estate": {
    sections: visualSections,
    stats: ["320 | Listings", "18 days | Average sale", "1.4% | Fee", "6 | Neighbourhoods"],
    faq: [
      "How is my home valued? | A free in-person appraisal against live comparables.",
      "Do you handle rentals? | Yes, including full property management.",
    ],
    quote: "Qualified viewing requests went up week over week.",
    author: "Elena Ruiz",
    role: "Managing Broker",
  },
  Photography: {
    sections: visualSections,
    stats: ["14 yrs | Shooting", "400+ | Weddings", "Editorial | Published", "48h | Sneak peek"],
    faq: [
      "How many images do I get? | Between 400 and 700 edited frames per full day.",
      "Do you travel? | Worldwide, with travel quoted transparently.",
    ],
    quote: "The galleries load instantly, even on hotel wifi.",
    author: "Jonas Berg",
    role: "Photographer",
  },
  "AI Startup": {
    sections: marketingSections,
    stats: ["120ms | P50 latency", "40+ | Models", "99.99% | Uptime", "SOC 2 | Type II"],
    faq: [
      "Do you train on my data? | Never — customer data is excluded from training by contract.",
      "Can I self-host? | Enterprise plans include a VPC deployment.",
    ],
    quote: "We replaced three vendors with one endpoint.",
    author: "Sana Iqbal",
    role: "Head of ML",
  },
  Crypto: {
    sections: marketingSections,
    stats: ["$2.4B | Volume", "Audited | 3 firms", "0.05% | Fees", "24/7 | Markets"],
    faq: [
      "Is the protocol audited? | Three independent audits, all reports public.",
      "Who holds the keys? | You do — the protocol is fully non-custodial.",
    ],
    quote: "The clearest explanation of a protocol I have read.",
    author: "Ricky Tan",
    role: "Community Lead",
  },
  Portfolio: {
    sections: visualSections,
    stats: ["9 yrs | Practice", "60+ | Projects", "4 | Awards", "Remote | Worldwide"],
    faq: [
      "Are you available? | Taking two new projects per quarter.",
      "What do you need to start? | Goals, timeline, and an honest budget range.",
    ],
    quote: "Best portfolio site I have seen this year.",
    author: "Maya Lindqvist",
    role: "Design Director",
  },
  "Landing Page": {
    sections: ["hero", "stats", "features", "testimonial", "faq", "cta", "footer"],
    stats: ["3.1x | Conversion lift", "1.2s | LCP", "0 | Cookie banners", "A+ | Vitals"],
    faq: [
      "How fast can this go live? | Publish to a custom domain in under ten minutes.",
      "Can I A/B test it? | Duplicate the page, change the variant, split traffic.",
    ],
    quote: "It converts better than the page our agency charged for.",
    author: "Hannah Cole",
    role: "Growth Lead",
  },
  Consulting: {
    sections: serviceSections,
    stats: ["£40M | Client value created", "70+ | Engagements", "22 | Industries", "4 | Partners"],
    faq: [
      "How long is an engagement? | Typically six to twelve weeks.",
      "Do you work fixed fee? | Yes, scoped and fixed after discovery.",
    ],
    quote: "They found seven figures of margin in six weeks.",
    author: "Alan Whitcombe",
    role: "COO",
  },
  Events: {
    sections: visualSections,
    stats: ["2 days | Programme", "48 | Speakers", "1,800 | Attendees", "Sold out | 2025"],
    faq: [
      "Are talks recorded? | Every session is published to ticket holders within a week.",
      "Is there a student rate? | Yes, 60% off with valid ID.",
    ],
    quote: "Ticket sales hit target three weeks early.",
    author: "Nadia Petrov",
    role: "Event Director",
  },
  Nonprofit: {
    sections: serviceSections,
    stats: ["£3.2M | Raised", "48k | People helped", "92p | Per £1 to programmes", "700 | Volunteers"],
    faq: [
      "Where does my money go? | 92p in every pound funds frontline programmes.",
      "Can I volunteer? | Local and remote roles open every month.",
    ],
    quote: "Recurring donations grew 40% after the redesign.",
    author: "Grace Adeyemi",
    role: "Fundraising Director",
  },
};

const LIME = "#c2f24a";
const CYAN = "#4ad4f2";
const EMBER = "#f4813e";
const VIOLET = "#a78bfa";
const ROSE = "#fb7185";
const MINT = "#5eead4";

export const landingTemplates: LandingTemplate[] = [
  // ---------- Startup ----------
  {
    slug: "orbit-seed",
    name: "Orbit Seed",
    category: "Startup",
    accent: LIME,
    blurb: "Pre-seed launch page with waitlist capture, traction bar and investor-ready story.",
    headline: "The operating system\nfor early teams",
    subhead: "Plan, ship and report on everything your first ten hires are working on.",
    cta: "Join the waitlist",
    features: [
      "One shared plan | Roadmap, sprint and retro in a single surface.",
      "Investor updates | Auto-drafted monthly updates from real activity.",
      "Zero admin | No project managers, no status meetings, no spreadsheets.",
    ],
  },
  {
    slug: "runway-launch",
    name: "Runway Launch",
    category: "Startup",
    accent: CYAN,
    blurb: "Product-launch page with countdown-ready hero, metrics and FAQ objection handling.",
    headline: "Launch day,\nhandled",
    subhead: "Everything you need to take a product from private beta to public launch.",
    cta: "Get early access",
    features: [
      "Launch checklist | 42 steps mapped to your ship date.",
      "Press kit | Assets, boilerplate and embargo links in one page.",
      "Signup analytics | See which channel actually drove activations.",
    ],
  },
  {
    slug: "founder-note",
    name: "Founder Note",
    category: "Startup",
    accent: VIOLET,
    blurb: "Long-form narrative launch page for founders who sell with a story, not a spec sheet.",
    headline: "We built the tool\nwe needed",
    subhead: "A short story about a slow problem, and the product that removed it.",
    cta: "Read the story",
    features: [
      "Editorial layout | Typographic rhythm tuned for long reads.",
      "Inline signup | Capture intent at the moment of persuasion.",
      "Quiet motion | Reveals that never fight the reading experience.",
    ],
  },
  // ---------- SaaS ----------
  {
    slug: "nova-saas",
    name: "Nova SaaS",
    category: "SaaS",
    accent: LIME,
    blurb: "Conversion-first product page with pricing matrix, social proof and changelog CMS.",
    headline: "Ship product,\nnot process",
    subhead: "The workspace that turns roadmap chaos into a weekly shipping rhythm.",
    cta: "Start free trial",
    features: [
      "Realtime boards | Everyone sees the same state, instantly.",
      "Automations | Route work without writing a single rule by hand.",
      "Insights | Cycle time, throughput and forecast in one dashboard.",
    ],
  },
  {
    slug: "ledger-cloud",
    name: "Ledger Cloud",
    category: "SaaS",
    accent: CYAN,
    blurb: "Fintech-grade SaaS page with compliance badges, security copy and enterprise CTA.",
    headline: "Accounting that\ncloses itself",
    subhead: "Continuous reconciliation for finance teams who are done with month-end.",
    cta: "Book a demo",
    features: [
      "Continuous close | Reconcile daily instead of scrambling monthly.",
      "Audit trail | Every change signed, timestamped and exportable.",
      "Bank sync | 14,000 institutions with same-day settlement data.",
    ],
  },
  {
    slug: "helpdesk-one",
    name: "Helpdesk One",
    category: "SaaS",
    accent: EMBER,
    blurb: "Support-tool landing page built around response-time proof and ROI maths.",
    headline: "Answer faster\nthan they expect",
    subhead: "Shared inbox, macros and AI drafts that keep first-response under four minutes.",
    cta: "Try it free",
    features: [
      "Shared inbox | Assign, snooze and collide-free reply.",
      "AI drafts | Suggested answers grounded in your own docs.",
      "SLA views | Know what is about to breach before it does.",
    ],
  },
  {
    slug: "pulse-analytics",
    name: "Pulse Analytics",
    category: "SaaS",
    accent: VIOLET,
    blurb: "Data-product page with metric storytelling, integrations grid and self-serve pricing.",
    headline: "Product analytics\nwithout the warehouse",
    subhead: "Funnels, retention and cohorts in minutes — no data team required.",
    cta: "See a live demo",
    features: [
      "Autocapture | Instrument once, ask questions forever.",
      "Cohorts | Slice retention by any property in two clicks.",
      "Warehouse sync | Mirror every event into your own storage.",
    ],
  },
  // ---------- Agency ----------
  {
    slug: "studio-kern",
    name: "Studio Kern",
    category: "Agency",
    accent: LIME,
    blurb: "Editorial agency site with case-study grid, service ladder and scroll storytelling.",
    headline: "Brands that behave\nlike products",
    subhead: "A design and engineering studio for companies in their second act.",
    cta: "Start a project",
    features: [
      "Brand systems | Identity, voice and motion as one system.",
      "Product design | Interfaces validated with real users, not opinions.",
      "Build | We ship the site we designed, no handover gap.",
    ],
  },
  {
    slug: "signal-collective",
    name: "Signal Collective",
    category: "Agency",
    accent: ROSE,
    blurb: "Performance-marketing agency page with results-led proof and audit lead magnet.",
    headline: "Growth you can\nactually attribute",
    subhead: "Paid, lifecycle and CRO run by one team against one revenue number.",
    cta: "Get a free audit",
    features: [
      "Paid media | Channel mix rebuilt around incremental return.",
      "Lifecycle | Email and retention flows that pay for the retainer.",
      "CRO | Continuous testing on the pages that matter.",
    ],
  },
  {
    slug: "north-forty",
    name: "North Forty",
    category: "Agency",
    accent: CYAN,
    blurb: "Boutique consultancy layout with team bios, process timeline and engagement models.",
    headline: "Small team,\nsenior only",
    subhead: "Four partners, no juniors, no account managers between you and the work.",
    cta: "Book an intro call",
    features: [
      "Senior delivery | The people who pitch are the people who build.",
      "Fixed sprints | Two-week increments with a demo at the end.",
      "Clear pricing | Published rates, no procurement theatre.",
    ],
  },
  // ---------- Ecommerce ----------
  {
    slug: "drop-culture",
    name: "Drop Culture",
    category: "Ecommerce",
    accent: EMBER,
    blurb: "Streetwear drop page with countdown hero, lookbook gallery and size-guide FAQ.",
    headline: "Drop 07\nlands Friday",
    subhead: "Limited run, numbered pieces, no restock. Set a reminder before it disappears.",
    cta: "Notify me",
    features: [
      "Numbered runs | Every piece carries its edition number.",
      "Made in Portugal | Cut and sewn in a family-run atelier.",
      "Instant checkout | Apple Pay, Shop Pay and one-tap reorder.",
    ],
  },
  {
    slug: "pantry-goods",
    name: "Pantry Goods",
    category: "Ecommerce",
    accent: MINT,
    blurb: "Subscription commerce page with plan comparison, delivery promise and reviews.",
    headline: "Real food,\ndelivered flat",
    subhead: "A rotating pantry box from growers we can name, at supermarket prices.",
    cta: "Build my box",
    features: [
      "Skip anytime | Pause, swap or cancel in one tap.",
      "Named growers | Every item traces back to a farm.",
      "Zero plastic | Returnable crates, compostable liners.",
    ],
  },
  {
    slug: "gear-lab",
    name: "Gear Lab",
    category: "Ecommerce",
    accent: CYAN,
    blurb: "Single-product hardware page with spec table, comparison and warranty trust blocks.",
    headline: "One bag.\nEvery trip.",
    subhead: "Forty litres, carry-on legal, built from recycled sailcloth and stubbornness.",
    cta: "Buy — $189",
    features: [
      "Carry-on legal | Fits every major airline sizer.",
      "Lifetime repair | We fix it or replace it, forever.",
      "Recycled sailcloth | 94% post-consumer, fully waterproof.",
    ],
  },
  {
    slug: "market-square",
    name: "Market Square",
    category: "Ecommerce",
    accent: LIME,
    blurb: "Multi-category storefront landing page with collection grid and promo strip.",
    headline: "Everything for\nthe good kitchen",
    subhead: "Cookware, ceramics and knives chosen by people who cook every night.",
    cta: "Shop collections",
    features: [
      "Curated only | 400 products, not 40,000.",
      "Free delivery | On every order over £50.",
      "Chef tested | Each item used in a working kitchen first.",
    ],
  },
  // ---------- Fashion ----------
  {
    slug: "atelier-noir",
    name: "Atelier Noir",
    category: "Fashion",
    accent: ROSE,
    blurb: "Runway-inspired fashion house page with full-bleed lookbook and collection story.",
    headline: "Spring / Summer\nTwenty Six",
    subhead: "Structured tailoring in undyed linen, cut for movement and weather.",
    cta: "View the collection",
    features: [
      "Undyed linen | Colour from the fibre, not the dye house.",
      "Made to measure | Two fittings, six weeks, one perfect jacket.",
      "Archive access | Past seasons available to members.",
    ],
  },
  {
    slug: "linen-house",
    name: "Linen House",
    category: "Fashion",
    accent: MINT,
    blurb: "Slow-fashion brand page with material provenance, care guide and editorial imagery.",
    headline: "Clothes that\noutlive trends",
    subhead: "Twelve pieces a year, made to be repaired rather than replaced.",
    cta: "Shop essentials",
    features: [
      "Twelve pieces | A deliberately small permanent collection.",
      "Free repairs | Send it back whenever it needs attention.",
      "Traceable | Mill, dye house and factory listed per garment.",
    ],
  },
  {
    slug: "kicks-index",
    name: "Kicks Index",
    category: "Fashion",
    accent: EMBER,
    blurb: "Sneaker-release page with raffle mechanics, gallery and hype countdown.",
    headline: "The raffle\nopens at noon",
    subhead: "Two hundred pairs. One entry each. Winners drawn live on Friday.",
    cta: "Enter the raffle",
    features: [
      "One entry each | Bot-resistant verification at signup.",
      "Live draw | Streamed and independently seeded.",
      "Instant refund | Losers are refunded before the stream ends.",
    ],
  },
  // ---------- Restaurant ----------
  {
    slug: "ember-table",
    name: "Ember Table",
    category: "Restaurant",
    accent: EMBER,
    blurb: "Fine-dining page with seasonal menu, reservation CTA and atmospheric gallery.",
    headline: "Fire, salt,\nand whatever is ready",
    subhead: "A twelve-course tasting menu written the morning it is served.",
    cta: "Reserve a table",
    features: [
      "Live fire | One hearth, no gas, everything over embers.",
      "Written daily | The menu changes with the market.",
      "Wine pairing | Low-intervention bottles from small growers.",
    ],
  },
  {
    slug: "corner-cafe",
    name: "Corner Cafe",
    category: "Restaurant",
    accent: MINT,
    blurb: "Neighbourhood cafe page with opening hours, menu highlights and map-ready contact.",
    headline: "Coffee worth\nwalking for",
    subhead: "Roasted two streets away, poured from seven, closed when the pastries run out.",
    cta: "See the menu",
    features: [
      "Own roast | Beans roasted 300 metres from the counter.",
      "All-day brunch | Served until we stop, usually three.",
      "Dog friendly | Water bowls and biscuits at the door.",
    ],
  },
  {
    slug: "night-kitchen",
    name: "Night Kitchen",
    category: "Restaurant",
    accent: VIOLET,
    blurb: "Late-night restaurant page with bold type, delivery links and events section.",
    headline: "Open until\nvery late",
    subhead: "Handmade noodles, natural wine and a room that stays loud until two.",
    cta: "Book tonight",
    features: [
      "Open late | Kitchen serves until 1:30am, seven days.",
      "Hand-pulled | Noodles made to order behind the pass.",
      "Walk-in bar | Sixteen seats, first come, always.",
    ],
  },
  // ---------- Hotel ----------
  {
    slug: "cliff-house",
    name: "Cliff House",
    category: "Hotel",
    accent: CYAN,
    blurb: "Boutique hotel page with suite gallery, direct-booking CTA and amenity grid.",
    headline: "A hotel on\nthe edge of the sea",
    subhead: "Forty-two suites cut into the cliff, each facing nothing but water.",
    cta: "Check availability",
    features: [
      "Sea-facing suites | Every room, no exceptions, no courtyard views.",
      "Thermal spa | Fed by the spring beneath the building.",
      "Direct rate | Always cheaper than the booking sites.",
    ],
  },
  {
    slug: "pine-lodge",
    name: "Pine Lodge",
    category: "Hotel",
    accent: MINT,
    blurb: "Mountain retreat page with seasonal packages, trail info and booking widget slot.",
    headline: "Wood smoke,\ncold air, deep sleep",
    subhead: "A twelve-cabin lodge at the treeline, an hour from the nearest traffic light.",
    cta: "Reserve a cabin",
    features: [
      "Twelve cabins | Private, wood-fired, no shared walls.",
      "Trails from the door | 140km of marked routes.",
      "Full board | Three meals cooked by one chef.",
    ],
  },
  {
    slug: "urban-stay",
    name: "Urban Stay",
    category: "Hotel",
    accent: VIOLET,
    blurb: "City aparthotel page with long-stay pricing, neighbourhood guide and floor plans.",
    headline: "Stay a week,\nstay a season",
    subhead: "Serviced apartments with real kitchens, in the part of town you actually want.",
    cta: "See rates",
    features: [
      "Real kitchens | Full hob, oven and dishwasher in every unit.",
      "Weekly rates | Up to 40% off for stays over seven nights.",
      "Workspace | Desk, monitor and 900Mbps in each apartment.",
    ],
  },
  // ---------- Healthcare ----------
  {
    slug: "clarity-clinic",
    name: "Clarity Clinic",
    category: "Healthcare",
    accent: CYAN,
    blurb: "Private clinic page with service list, practitioner bios and appointment form.",
    headline: "Care that answers\nthe phone",
    subhead: "Same-week appointments with clinicians who read your notes before you arrive.",
    cta: "Book an appointment",
    features: [
      "Same-week access | Most appointments within 48 hours.",
      "One clinician | You see the same person each visit.",
      "Transparent fees | Every price published before you book.",
    ],
  },
  {
    slug: "bright-dental",
    name: "Bright Dental",
    category: "Healthcare",
    accent: MINT,
    blurb: "Dental practice page with treatment pricing, nervous-patient copy and booking flow.",
    headline: "Dentistry without\nthe dread",
    subhead: "Sedation options, honest quotes and a team trained for anxious patients.",
    cta: "Request a consult",
    features: [
      "Fixed quotes | Written before any treatment begins.",
      "Sedation available | From mild relaxation to full sedation.",
      "Evening clinics | Open until 8pm three nights a week.",
    ],
  },
  {
    slug: "mindwell",
    name: "Mindwell",
    category: "Healthcare",
    accent: VIOLET,
    blurb: "Therapy practice page with modality explainer, matching form and privacy assurances.",
    headline: "Therapy that\nfits your week",
    subhead: "Matched to a therapist in three days, online or in person, evenings included.",
    cta: "Find my therapist",
    features: [
      "Matched in 3 days | A real clinician reviews every request.",
      "Evenings & weekends | Sessions outside working hours.",
      "Confidential | Notes encrypted, never shared without consent.",
    ],
  },
  // ---------- Education ----------
  {
    slug: "atlas-learn",
    name: "Atlas Learn",
    category: "Education",
    accent: LIME,
    blurb: "Online course page with curriculum outline, instructor proof and cohort pricing.",
    headline: "Learn it properly,\nonce",
    subhead: "A twelve-week programme with real projects, code review and a live cohort.",
    cta: "Enrol now",
    features: [
      "Live cohort | Weekly sessions with the instructor, not a recording.",
      "Code review | Every project reviewed by a working engineer.",
      "Career support | Portfolio, CV and interview practice included.",
    ],
  },
  {
    slug: "campus-open",
    name: "Campus Open",
    category: "Education",
    accent: CYAN,
    blurb: "University department page with programme cards, open-day CTA and admissions FAQ.",
    headline: "Open day,\nthis November",
    subhead: "Meet the faculty, tour the labs and sit in on a first-year lecture.",
    cta: "Register for open day",
    features: [
      "Meet faculty | Small-group sessions with course leaders.",
      "Lab tours | See the equipment you will actually use.",
      "Funding clinic | Bursaries and scholarships explained in person.",
    ],
  },
  {
    slug: "kids-code",
    name: "Kids Code",
    category: "Education",
    accent: EMBER,
    blurb: "Youth-programme page with age tiers, safeguarding info and parent signup form.",
    headline: "Where kids build\ntheir first game",
    subhead: "After-school clubs for ages 8–15, taught by DBS-checked engineers.",
    cta: "Reserve a place",
    features: [
      "Small groups | One instructor per six children.",
      "Safeguarded | Every tutor DBS-checked and trained.",
      "Take it home | Projects run on any home computer.",
    ],
  },
  // ---------- Architecture ----------
  {
    slug: "form-practice",
    name: "Form Practice",
    category: "Architecture",
    accent: MINT,
    blurb: "Architecture studio page with monograph-style project gallery and RIBA stage explainer.",
    headline: "Buildings that\nage well",
    subhead: "A practice working in stone, timber and daylight across housing and culture.",
    cta: "View built work",
    features: [
      "Material first | Detailing developed with the makers.",
      "Low energy | Passivhaus principles on every project.",
      "Full service | RIBA stages 0 through 7 in house.",
    ],
  },
  {
    slug: "plan-and-section",
    name: "Plan & Section",
    category: "Architecture",
    accent: CYAN,
    blurb: "Residential-focused studio page with extension packages and planning-permission FAQ.",
    headline: "Your house,\nbut it works",
    subhead: "Extensions, loft conversions and remodels with planning handled end to end.",
    cta: "Book a site visit",
    features: [
      "Planning handled | Applications drawn, submitted and defended.",
      "Fixed feasibility | A costed options study for one flat fee.",
      "Builder network | Vetted contractors who know our drawings.",
    ],
  },
  {
    slug: "civic-works",
    name: "Civic Works",
    category: "Architecture",
    accent: VIOLET,
    blurb: "Public-sector practice page with framework credentials and consultation timeline.",
    headline: "Architecture for\npublic life",
    subhead: "Schools, libraries and health centres delivered on framework and on budget.",
    cta: "Download credentials",
    features: [
      "Framework listed | Approved on four national frameworks.",
      "Community led | Consultation built into every stage.",
      "On budget | 96% of projects delivered within contract sum.",
    ],
  },
  // ---------- Construction ----------
  {
    slug: "steel-and-stone",
    name: "Steel & Stone",
    category: "Construction",
    accent: EMBER,
    blurb: "Main contractor page with capability stats, safety record and tender enquiry form.",
    headline: "Built right,\nhanded over early",
    subhead: "A main contractor for commercial fit-out and new-build across the region.",
    cta: "Request a quote",
    features: [
      "Directly employed | Our own trades, not a chain of subs.",
      "Safety first | 0.4 incident rate across 240 projects.",
      "Fixed price | Contract sums that survive to completion.",
    ],
  },
  {
    slug: "homebuild-co",
    name: "Homebuild Co",
    category: "Construction",
    accent: LIME,
    blurb: "Residential builder page with project galleries, staged pricing and guarantee blocks.",
    headline: "Extensions without\nthe horror stories",
    subhead: "Fixed quotes, weekly photo updates and a named site manager on every job.",
    cta: "Get a fixed quote",
    features: [
      "Named manager | One contact from survey to handover.",
      "Weekly updates | Photos and progress every Friday.",
      "10-year guarantee | Structural warranty on all work.",
    ],
  },
  {
    slug: "trade-partners",
    name: "Trade Partners",
    category: "Construction",
    accent: CYAN,
    blurb: "Specialist subcontractor page with accreditations, sectors served and rapid callback form.",
    headline: "The trade other\ntrades call",
    subhead: "Mechanical and electrical installation for commercial projects up to £20M.",
    cta: "Talk to an estimator",
    features: [
      "Accredited | NICEIC, Gas Safe and CHAS approved.",
      "24h estimates | Priced within one working day.",
      "Nationwide | Crews mobilised across the UK.",
    ],
  },
  // ---------- Real Estate ----------
  {
    slug: "northside",
    name: "Northside",
    category: "Real Estate",
    accent: LIME,
    blurb: "Estate-agency page with listing grid, valuation CTA and neighbourhood guides.",
    headline: "Sold in eighteen days,\non average",
    subhead: "A local agency with national reach and a fee that does not insult you.",
    cta: "Book a valuation",
    features: [
      "1.4% fee | No withdrawal charges, no tie-in beyond 12 weeks.",
      "Pro photography | Every listing shot and floor-planned.",
      "Accompanied viewings | Seven days a week, evenings included.",
    ],
  },
  {
    slug: "harbour-lofts",
    name: "Harbour Lofts",
    category: "Real Estate",
    accent: CYAN,
    blurb: "New-development page with unit availability, floor plans and reservation flow.",
    headline: "Forty lofts\non the water",
    subhead: "Warehouse conversion with original steel, five-metre ceilings and a private dock.",
    cta: "Register interest",
    features: [
      "Original structure | Retained steel, brick and crane rails.",
      "Five-metre ceilings | Mezzanine-ready in every unit.",
      "Private dock | Resident moorings and a shared boathouse.",
    ],
  },
  {
    slug: "let-simple",
    name: "Let Simple",
    category: "Real Estate",
    accent: MINT,
    blurb: "Lettings and management page with landlord pricing tiers and compliance checklist.",
    headline: "Letting, without\nthe 3am phone call",
    subhead: "Full management for landlords who want the income and none of the incidents.",
    cta: "Compare packages",
    features: [
      "Full management | Tenancy, repairs and compliance handled.",
      "Rent guarantee | Twelve months covered as standard.",
      "Compliance | Gas, electric and EPC tracked automatically.",
    ],
  },
  // ---------- Photography ----------
  {
    slug: "monolith",
    name: "Monolith",
    category: "Photography",
    accent: LIME,
    blurb: "Oversized-type photography portfolio with full-bleed gallery and enquiry CTA.",
    headline: "Light, and what\nit falls on",
    subhead: "Editorial and architectural photography from a studio that shoots on location.",
    cta: "See the work",
    features: [
      "Editorial | Commissions for print and brand campaigns.",
      "Architectural | Interiors and exteriors, natural light only.",
      "Fast turnaround | Selects in 48 hours, finals in a week.",
    ],
  },
  {
    slug: "vow-and-veil",
    name: "Vow & Veil",
    category: "Photography",
    accent: ROSE,
    blurb: "Wedding photography page with package tiers, gallery and booking enquiry form.",
    headline: "The day, exactly\nas it felt",
    subhead: "Documentary wedding photography — no posing, no lists, no lost hours.",
    cta: "Check my date",
    features: [
      "Documentary | Nothing staged, nothing interrupted.",
      "Two shooters | Standard on every full-day package.",
      "48h preview | A sneak-peek gallery before the honeymoon.",
    ],
  },
  {
    slug: "frame-studio",
    name: "Frame Studio",
    category: "Photography",
    accent: VIOLET,
    blurb: "Commercial studio page with product-shot pricing, rate card and client logos.",
    headline: "Product photography\nthat sells the product",
    subhead: "A studio built for ecommerce volume — 200 SKUs a day, consistent every time.",
    cta: "Get a rate card",
    features: [
      "200 SKUs a day | Automated capture, human retouching.",
      "Consistent | Colour-managed against your brand profile.",
      "Any format | Stills, 360 spins and short-form video.",
    ],
  },
  // ---------- AI Startup ----------
  {
    slug: "synapse-ai",
    name: "Synapse AI",
    category: "AI Startup",
    accent: CYAN,
    blurb: "Model-launch page with benchmark stats, API snippet slot and waitlist capture.",
    headline: "One API for\nevery model",
    subhead: "Route requests across forty models with automatic fallback and cost controls.",
    cta: "Get an API key",
    features: [
      "Automatic fallback | Never fail because one provider is down.",
      "Cost routing | Send each request to the cheapest capable model.",
      "Observability | Token, latency and quality traces per call.",
    ],
  },
  {
    slug: "agent-works",
    name: "Agent Works",
    category: "AI Startup",
    accent: VIOLET,
    blurb: "AI-agent platform page with workflow explainer, security section and demo CTA.",
    headline: "Agents that finish\nthe job",
    subhead: "Durable, observable agents with human approval steps where they matter.",
    cta: "Watch the demo",
    features: [
      "Durable runs | Resume exactly where a step failed.",
      "Human in the loop | Approvals before anything irreversible.",
      "Full traces | Every tool call recorded and replayable.",
    ],
  },
  {
    slug: "vector-desk",
    name: "Vector Desk",
    category: "AI Startup",
    accent: MINT,
    blurb: "RAG-product page with data-privacy proof, integration grid and technical FAQ.",
    headline: "Answers from\nyour own documents",
    subhead: "Connect your drive, wiki and tickets — get cited answers in under a second.",
    cta: "Connect a source",
    features: [
      "Citations always | Every answer links back to the source line.",
      "Private by default | Your data never leaves your tenant.",
      "40 connectors | Drive, Notion, Confluence, Zendesk and more.",
    ],
  },
  {
    slug: "voice-lab",
    name: "Voice Lab",
    category: "AI Startup",
    accent: EMBER,
    blurb: "Speech-product page with latency proof, sample player slot and developer pricing.",
    headline: "Voices that do not\nsound like robots",
    subhead: "Sub-200ms streaming speech with cloning, in thirty-two languages.",
    cta: "Hear a sample",
    features: [
      "180ms first byte | Fast enough for live conversation.",
      "32 languages | Consistent identity across every one.",
      "Consent-gated cloning | Verified permission before any voice is cloned.",
    ],
  },
  // ---------- Crypto ----------
  {
    slug: "chainline",
    name: "Chainline",
    category: "Crypto",
    accent: LIME,
    blurb: "Protocol landing page with audit badges, tokenomics section and docs CTA.",
    headline: "Settlement in\none block",
    subhead: "A non-custodial settlement layer with audited contracts and public reserves.",
    cta: "Read the docs",
    features: [
      "Non-custodial | Keys never leave your wallet.",
      "Three audits | Reports published in full, no redactions.",
      "Public reserves | Proof-of-reserve refreshed every block.",
    ],
  },
  {
    slug: "vault-dao",
    name: "Vault DAO",
    category: "Crypto",
    accent: VIOLET,
    blurb: "DAO governance page with proposal timeline, treasury stats and delegate signup.",
    headline: "Governance that\npeople actually read",
    subhead: "Proposals, treasury and delegate positions in plain language.",
    cta: "Become a delegate",
    features: [
      "Plain-language proposals | Every proposal summarised before the vote.",
      "Open treasury | Live balances and spend history.",
      "Delegate profiles | Voting records published in full.",
    ],
  },
  {
    slug: "mint-pass",
    name: "Mint Pass",
    category: "Crypto",
    accent: ROSE,
    blurb: "Digital-collectible page with allowlist mechanics, roadmap and rarity gallery.",
    headline: "Two thousand\npasses. That is all.",
    subhead: "A membership pass with on-chain benefits and a public, funded roadmap.",
    cta: "Join the allowlist",
    features: [
      "Fixed supply | 2,000 passes, contract-enforced.",
      "Funded roadmap | Treasury locked and milestone-released.",
      "Real utility | Event access and revenue share, on chain.",
    ],
  },
  // ---------- Portfolio ----------
  {
    slug: "index-personal",
    name: "Index",
    category: "Portfolio",
    accent: LIME,
    blurb: "Minimal personal portfolio with project index, about section and contact CTA.",
    headline: "Designer,\nbuilder, occasional writer",
    subhead: "I design products for small teams and build the front end myself.",
    cta: "See selected work",
    features: [
      "Product design | End-to-end, research through to shipped UI.",
      "Front end | React, TypeScript and a lot of CSS.",
      "Writing | Notes on interface craft, twice a month.",
    ],
  },
  {
    slug: "reel-motion",
    name: "Reel",
    category: "Portfolio",
    accent: VIOLET,
    blurb: "Motion-designer portfolio with showreel slot, client grid and rate enquiry.",
    headline: "Motion that\nearns the second",
    subhead: "Title sequences, product films and broadcast idents for brands with taste.",
    cta: "Watch the reel",
    features: [
      "Title design | Sequences for film, series and events.",
      "Product film | Explainers that survive a mute autoplay.",
      "Idents | Broadcast packaging and channel branding.",
    ],
  },
  {
    slug: "dev-resume",
    name: "Dev Resume",
    category: "Portfolio",
    accent: CYAN,
    blurb: "Engineer portfolio with stack list, open-source proof and hire-me CTA.",
    headline: "Backend engineer,\navailable Q4",
    subhead: "Distributed systems, Go and Postgres. Twelve years, four of them on call.",
    cta: "Download CV",
    features: [
      "Systems | Event-driven services at seven-figure QPS.",
      "Open source | Maintainer of two widely used libraries.",
      "Mentoring | I coach mid-level engineers to senior.",
    ],
  },
  {
    slug: "writer-desk",
    name: "Writer Desk",
    category: "Portfolio",
    accent: MINT,
    blurb: "Writer and journalist portfolio with clipping index, bio and commission enquiry.",
    headline: "Words for\nawkward subjects",
    subhead: "Long-form reporting on housing, labour and the places policy forgets.",
    cta: "Read clippings",
    features: [
      "Long form | Features from 2,000 to 12,000 words.",
      "Investigations | FOI, data and doorstep reporting.",
      "Editing | Commission editing for small publications.",
    ],
  },
  // ---------- Landing Page ----------
  {
    slug: "single-offer",
    name: "Single Offer",
    category: "Landing Page",
    accent: LIME,
    blurb: "Classic direct-response landing page: one promise, one CTA, zero navigation.",
    headline: "One page.\nOne outcome.",
    subhead: "A stripped-back offer page built for paid traffic and ruthless measurement.",
    cta: "Claim the offer",
    features: [
      "No navigation | Nothing to click except the offer.",
      "Above the fold | Promise, proof and button before any scroll.",
      "Fast | Under 40KB of critical path.",
    ],
  },
  {
    slug: "webinar-signup",
    name: "Webinar Signup",
    category: "Landing Page",
    accent: CYAN,
    blurb: "Event registration page with agenda, speaker proof and calendar-ready CTA.",
    headline: "Live, Thursday,\n45 minutes",
    subhead: "A working session on shipping faster, with the slides sent afterwards.",
    cta: "Save my seat",
    features: [
      "Live Q&A | Half the session is your questions.",
      "Slides sent | Deck and recording emailed within a day.",
      "No pitch | Fifteen minutes of product, clearly labelled.",
    ],
  },
  {
    slug: "lead-magnet",
    name: "Lead Magnet",
    category: "Landing Page",
    accent: EMBER,
    blurb: "Gated-asset page with preview spread, trust markers and single-field form.",
    headline: "The 40-page guide\nwe usually charge for",
    subhead: "Everything we learned running 300 campaigns, written down and free.",
    cta: "Download the guide",
    features: [
      "One field | Just your email, nothing else.",
      "No sequence | One email, with the file attached.",
      "Actually useful | Templates and numbers, not vague advice.",
    ],
  },
  {
    slug: "app-install",
    name: "App Install",
    category: "Landing Page",
    accent: VIOLET,
    blurb: "Mobile-app landing page with device mockup slot, store badges and review proof.",
    headline: "Your whole day,\none screen",
    subhead: "The planner that gets out of the way — free, no account required to start.",
    cta: "Get the app",
    features: [
      "No account | Start planning before you sign up.",
      "Offline first | Everything works on a plane.",
      "Private | Data stored on device by default.",
    ],
  },
  // ---------- Consulting ----------
  {
    slug: "advisory-partners",
    name: "Advisory Partners",
    category: "Consulting",
    accent: CYAN,
    blurb: "Management-consultancy page with practice areas, outcome proof and enquiry form.",
    headline: "Advice you can\nact on Monday",
    subhead: "Operating strategy for mid-market companies, delivered by people who ran them.",
    cta: "Arrange a call",
    features: [
      "Operators | Every partner has run a P&L.",
      "Six-week sprints | Findings and a plan, not a doorstop deck.",
      "Implementation | We stay through the first ninety days.",
    ],
  },
  {
    slug: "tax-and-books",
    name: "Tax & Books",
    category: "Consulting",
    accent: MINT,
    blurb: "Accountancy practice page with package pricing, deadline calendar and onboarding form.",
    headline: "Accounts filed\nbefore you worry",
    subhead: "Bookkeeping, payroll and filings for owner-managed businesses, fixed monthly.",
    cta: "See packages",
    features: [
      "Fixed monthly | One price, all filings included.",
      "Deadline tracked | We chase you, not the other way round.",
      "Real accountant | Same named contact every month.",
    ],
  },
  {
    slug: "hr-collective",
    name: "HR Collective",
    category: "Consulting",
    accent: ROSE,
    blurb: "People-operations consultancy page with service tiers, policy library and contact form.",
    headline: "HR for companies\nwithout an HR team",
    subhead: "Contracts, handbooks and hard conversations, handled by qualified advisers.",
    cta: "Talk to an adviser",
    features: [
      "On call | Same-day advice on employment questions.",
      "Documents | Contracts and handbooks kept legally current.",
      "Investigations | Independent handling of grievances.",
    ],
  },
  // ---------- Events ----------
  {
    slug: "summit-26",
    name: "Summit 26",
    category: "Events",
    accent: LIME,
    blurb: "Conference page with speaker grid, agenda timeline and tiered ticket CTA.",
    headline: "Two days.\nForty-eight speakers.",
    subhead: "The conference for people who build on the web, back for its ninth year.",
    cta: "Get tickets",
    features: [
      "Two tracks | Craft and engineering, running in parallel.",
      "Workshops | Six hands-on sessions, capped at thirty.",
      "Hallway track | Long breaks, on purpose.",
    ],
  },
  {
    slug: "festival-grounds",
    name: "Festival Grounds",
    category: "Events",
    accent: EMBER,
    blurb: "Music-festival page with lineup poster layout, stage times and ticket tiers.",
    headline: "Three stages,\none weekend",
    subhead: "Sixty artists across a working farm, camping included with every ticket.",
    cta: "Buy a weekend pass",
    features: [
      "Camping included | Pitch, showers and water in every ticket.",
      "Local food only | Twenty traders, all within fifty miles.",
      "Family field | Under-12s free, quiet camping available.",
    ],
  },
  {
    slug: "workshop-series",
    name: "Workshop Series",
    category: "Events",
    accent: VIOLET,
    blurb: "Recurring-workshop page with dates list, venue details and small-group signup.",
    headline: "Small rooms,\nreal practice",
    subhead: "Twelve-person workshops that end with something you actually built.",
    cta: "Reserve a seat",
    features: [
      "Twelve seats | Enough attention for everyone.",
      "Build something | You leave with finished work.",
      "Materials included | Everything supplied on the day.",
    ],
  },
  // ---------- Nonprofit ----------
  {
    slug: "common-good",
    name: "Common Good",
    category: "Nonprofit",
    accent: MINT,
    blurb: "Charity page with impact statistics, donation tiers and volunteer signup form.",
    headline: "92p of every pound\nreaches the front line",
    subhead: "Emergency food, advice and housing support across eleven boroughs.",
    cta: "Donate monthly",
    features: [
      "Direct support | Food, advice and emergency housing.",
      "Local delivery | Eleven boroughs, forty partner centres.",
      "Published accounts | Full financials online every quarter.",
    ],
  },
  {
    slug: "green-belt",
    name: "Green Belt",
    category: "Nonprofit",
    accent: LIME,
    blurb: "Environmental campaign page with petition CTA, evidence section and press links.",
    headline: "Protect what is\nleft of the green belt",
    subhead: "A campaign backed by ecologists, planners and forty thousand residents.",
    cta: "Sign the petition",
    features: [
      "Evidence led | Every claim sourced and footnoted.",
      "Legal action | Judicial reviews funded by supporters.",
      "Local groups | Sixty branches organising in person.",
    ],
  },
  {
    slug: "shelter-fund",
    name: "Shelter Fund",
    category: "Nonprofit",
    accent: EMBER,
    blurb: "Emergency-appeal page with urgency framing, cost-per-outcome and one-tap donation.",
    headline: "£30 shelters\none family tonight",
    subhead: "An emergency appeal for families displaced by this winter's flooding.",
    cta: "Give now",
    features: [
      "£30 | Shelter for a family for one night.",
      "£120 | A week of food and clean water.",
      "£500 | Rebuild materials for one home.",
    ],
  },
  {
    slug: "youth-futures",
    name: "Youth Futures",
    category: "Nonprofit",
    accent: CYAN,
    blurb: "Youth-charity page with programme outcomes, mentor recruitment and funder logos.",
    headline: "Every young person\ndeserves a second adult",
    subhead: "Mentoring that keeps teenagers in education, one relationship at a time.",
    cta: "Become a mentor",
    features: [
      "One-to-one | Matched mentors for twelve months minimum.",
      "Measured | 88% stay in education or training.",
      "Trained | Forty hours of safeguarding and coaching training.",
    ],
  },
];

export const templateCategoryList = [
  "All",
  ...Array.from(new Set(landingTemplates.map((t) => t.category))),
] as const;

export const templateBySlug = (slug: string) => landingTemplates.find((t) => t.slug === slug);

const scoreFor = (t: LandingTemplate, offset: number) => {
  const seed = t.slug.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return 94 + ((seed + offset) % 7);
};

export const templateScores = (t: LandingTemplate) => ({
  seo: t.seo ?? scoreFor(t, 0),
  a11y: t.a11y ?? scoreFor(t, 3),
  perf: t.perf ?? scoreFor(t, 5),
});

const galleryFor = (accentIndex: number) => [
  `https://images.unsplash.com/photo-16${20 + accentIndex}121692029-d088224ddc74?w=900&q=80`,
];

/** Build the concrete editor nodes for a template. */
export function templateNodes(t: LandingTemplate): BuilderNode[] {
  const recipe = categoryRecipes[t.category];
  const stats = t.stats ?? recipe.stats;
  const faq = t.faq ?? recipe.faq;

  return recipe.sections.map((type) => {
    const node = createNode(type);
    switch (type) {
      case "hero":
        node.props = {
          eyebrow: t.category,
          title: t.headline,
          subtitle: t.subhead,
          primary: t.cta,
          primaryHref: "#contact",
          secondary: "Learn more",
        };
        break;
      case "stats":
        node.props = { items: stats };
        node.styles.base = { ...node.styles.base, columns: Math.min(stats.length, 4) };
        break;
      case "features":
        node.props = { title: `Why ${t.name}`, items: t.features };
        node.styles.base = { ...node.styles.base, columns: Math.min(t.features.length, 3) };
        break;
      case "testimonial":
        node.props = {
          quote: t.quote ?? recipe.quote,
          author: t.author ?? recipe.author,
          role: t.role ?? recipe.role,
        };
        break;
      case "faq":
        node.props = { title: "Questions, answered", items: faq };
        break;
      case "cta":
        node.props = {
          title: t.cta,
          subtitle: t.blurb,
          label: t.cta,
          href: "#contact",
        };
        node.styles.base = { ...node.styles.base, background: `${t.accent}1a` };
        break;
      case "form":
        node.props = { title: "Get in touch", fields: ["Name", "Email", "Message"], label: t.cta };
        break;
      case "gallery":
        node.props = {
          images: [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80",
            "https://images.unsplash.com/photo-1614851099511-773084f6911d?w=900&q=80",
            "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=900&q=80",
            ...galleryFor(0).slice(1),
          ],
        };
        break;
      case "footer":
        node.props = {
          brand: t.name,
          links: ["Overview", "Features", "Pricing", "Contact"],
          note: `© ${new Date().getFullYear()} ${t.name}. Built with RetailX.`,
        };
        break;
      default:
        break;
    }
    return node;
  });
}

/** Turn a template into a full project ready for the visual editor. */
export function buildTemplateProject(t: LandingTemplate): BuilderProject {
  return {
    id: uid(),
    name: t.name,
    domain: `${t.slug}.retailx.site`,
    theme: { ...defaultTheme, accent: t.accent },
    pages: [
      {
        id: uid(),
        name: "Home",
        slug: "/",
        seo: {
          title: `${t.name} — ${t.category} landing page`,
          description: t.blurb,
        },
        nodes: templateNodes(t),
      },
    ],
    deployments: [],
    updatedAt: new Date().toISOString(),
    publishedAt: null,
  };
}
