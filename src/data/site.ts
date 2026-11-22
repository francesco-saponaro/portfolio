import type { ShapeName } from "@/components/site/shapes";

// The words on the page, in one place.

export const PERSON = {
  name: "Francesco Saponaro",
  role: "Full-stack developer",
  city: "Paris",
  email: "francescosaponaro5@gmail.com",
  github: "https://github.com/francesco-saponaro",
  githubLabel: "github.com/francesco-saponaro",
  linkedin: "https://www.linkedin.com/in/francesco-saponaro87",
  linkedinLabel: "linkedin.com/in/francesco-saponaro87",
} as const;

export const HERO = {
  kicker: "Full-stack developer · Paris",
  lines: ["Francesco Saponaro.", "TypeScript, end to end."],
  lead: "Five years building web and mobile products in TypeScript, from the data model to the last screen: React and Next.js in front, Node.js and PostgreSQL behind, Expo for mobile. Now also building security tools.",
} as const;

export const MANIFESTO =
  "I'm often the only developer on a product, so I own all of it: the schema, the API, the screens, the release. About a dozen shipped so far. Next: software that keeps people and their data safe.";

export interface Job {
  shape: ShapeName;
  time: string;
  org: string;
  role: string;
  text: string;
  points?: string[];
}

export const WORK: Job[] = [
  {
    shape: "gear",
    time: "2024 – now",
    org: "Zumbat Hub",
    role: "Full-stack and app developer",
    text: "The developer the company comes to for everything: web platforms, mobile apps, backends and integrations, for clients in e-commerce, food, utilities and internal tools. I make the technical calls and work with clients on scope.",
    points: [
      "Built the core frontend of a large e-commerce platform in Next.js and TypeScript.",
      "Specified and built a demand and inventory planning SaaS for a direct-sales company: weekly planning grids, its own commercial calendar, warehouse and pallet rules.",
      "Building forecasting and warehouse dashboards for a second client, with automatic stock balancing between warehouses.",
      "Rebuilt the company's flagship mobile app from Flutter to Expo and shipped it on the App Store, Google Play and Huawei AppGallery.",
    ],
  },
  {
    shape: "house",
    time: "2022 – 2024",
    org: "Houseplus Innovation",
    role: "Full-stack developer",
    text: "Frontend and backend work on the platform of an AI company that helps real-estate professionals value properties and read where the market is going.",
  },
];

export type Tone = "mint" | "tangerine" | "sky" | "butter" | "lilac";
export const TONES: Tone[] = ["mint", "tangerine", "sky", "butter", "lilac"];

export const HOW: Array<{ tone: Tone; title: string; text: string }> = [
  { tone: "mint", title: "Think it through first", text: "I work out the data model and the architecture before I write code. It is what keeps a product solid when the pace picks up." },
  { tone: "tangerine", title: "Plain, tested code", text: "Strict TypeScript, every input checked at the edge, tests against a real database, CI on every push. Code a colleague can pick up on day one." },
  { tone: "sky", title: "Coding agents, with judgment", text: "I use coding agents every day. I write the spec, give them the context, review every diff and own what ships." },
];

export const FACTS: Array<{ label: string; text: string }> = [
  { label: "Languages", text: "English, advanced (C1). Italian, native. Portuguese, conversational. French, learning." },
  { label: "Where", text: "Paris. In the office, hybrid or remote." },
  { label: "Citizenship", text: "Italian and British: free to work in the EU and the UK." },
];
