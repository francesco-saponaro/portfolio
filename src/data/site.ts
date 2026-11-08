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
  lead: "I build web and mobile products in TypeScript: React and Next.js on the front, Node.js and SQL on the back, Expo for mobile. Usually the only developer on the product, from the data model to the screen.",
} as const;

export const MANIFESTO =
  "I like owning the whole thing: the schema, the API, the interface, the deploy. About a dozen products so far, from the core frontend of a large e-commerce platform to a demand planning SaaS and a mobile app rebuilt from scratch in React Native.";

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
    text: "Web platforms, mobile apps, backends and integrations for clients in e-commerce, food, utilities and internal tools; I make the technical decisions and build end to end.",
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
  { tone: "sky", title: "Coding agents, with judgment", text: "I write the spec, give the context, review every diff and own what ships." },
];

export const FACTS: Array<{ label: string; text: string }> = [
  { label: "Languages", text: "English, fluent. Italian, native. Portuguese, conversational. French, learning." },
  { label: "Where", text: "Paris. Open to remote." },
  { label: "Citizenship", text: "Italian and British." },
];
