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
  lead: "I build web and mobile products in TypeScript, from the data model to the screen: React and Next.js in front, Node.js and PostgreSQL behind, Expo for mobile. Lately, security tools.",
} as const;

export const MANIFESTO =
  "I like owning the whole thing: the schema, the API, the interface, the deploy. About a dozen products so far, and now security, where you have to really know your subject.";

export interface Job {
  shape: ShapeName;
  time: string;
  org: string;
  role: string;
  text: string;
}

export const WORK: Job[] = [
  {
    shape: "gear",
    time: "2024 – now",
    org: "Zumbat Hub",
    role: "Full-stack and app developer",
    text: "Web platforms, mobile apps and backends for clients, end to end. Stanhome Planner, a demand-planning SaaS I specified and built; card payments with 3D Secure in the ZetaBarber app; and the company's flagship app, rebuilt from Flutter to Expo.",
  },
  {
    shape: "clipboard",
    time: "2021 – 2024",
    org: "Houseplus Innovation",
    role: "Full-stack developer",
    text: "Applications across frontend and backend for an AI company working on real-estate valuation.",
  },
];

export type Tone = "mint" | "tangerine" | "sky" | "butter" | "lilac";
export const TONES: Tone[] = ["mint", "tangerine", "sky", "butter", "lilac"];

export const HOW: Array<{ tone: Tone; title: string; text: string }> = [
  { tone: "mint", title: "Own it end to end", text: "From the data model to the interface to the deploy. One person who knows why every part is the way it is." },
  { tone: "tangerine", title: "Plain, tested code", text: "TypeScript strict, tests that reconcile the numbers, small modules that do one thing. Boring on purpose." },
  { tone: "sky", title: "Coding agents, with judgment", text: "A written spec and reusable skills before the agent writes a line. Then I review every diff, and the tests and CI decide what ships." },
];

export const FACTS: Array<{ label: string; text: string }> = [
  { label: "Languages", text: "English, fluent. Italian, native. Portuguese, conversational. French, learning." },
  { label: "Where", text: "Paris. Open to remote." },
  { label: "Citizenship", text: "Italian and British." },
];
