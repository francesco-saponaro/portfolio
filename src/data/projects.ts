// The projects on the page. Retest has its own section (retest.ts); the rest
// are cards in the strip, in the order given. Each card shows a screenshot of
// the running app, so `image` is a file in public/work/ with its alt text.
export interface Project {
  slug: string;
  name: string;
  summary: string;
  stack: string[];
  repo?: string;
  live?: string;
  year: number;
  image?: { src: string; alt: string };
}

export const PROJECTS: Project[] = [
  {
    slug: "nightshift",
    name: "Nightshift",
    summary:
      "An on-call engineer that never sleeps. An error comes in from the error tracker, a reproduction is written, a coding agent fixes it in its own checkout, the fix is verified and reviewed, and a pull request opens.",
    stack: ["TypeScript", "Fastify", "pg-boss", "React", "TanStack", "Claude Agent SDK"],
    repo: "https://github.com/francesco-saponaro/nightshift",
    live: "https://nightshift-francesco-saponaro.netlify.app",
    year: 2026,
    image: {
      src: "/work/nightshift.webp",
      alt: "Nightshift's incidents screen: three incidents, each fixed overnight, with where the time went and the branch each fix is on.",
    },
  },
  {
    slug: "cybermaster",
    name: "CyberMaster",
    summary:
      "A browser game that teaches security by doing it: edit raw HTTP, read a packet capture, fix vulnerable code, sweep a network from a terminal, lock down a cloud account. Sixty-two levels in ten zones.",
    stack: ["React", "TanStack Router", "Vite", "Tailwind", "zod"],
    repo: "https://github.com/francesco-saponaro/cybermaster",
    live: "https://cybermaster-francesco-saponaro.netlify.app",
    year: 2026,
    image: {
      src: "/work/cybermaster.webp",
      alt: "CyberMaster's home screen: Join the Watch, with today's case and the first level to play.",
    },
  },
  {
    slug: "cagnotte",
    name: "Cagnotte",
    summary:
      "A cashback app and its back office. The heart is the settlement: affiliate files matched to the activations behind them, cashback computed by the offer's rules, and a double-entry ledger that reconciles to the cent.",
    stack: ["Expo", "React Native", "Fastify", "Drizzle", "PostgreSQL"],
    repo: "https://github.com/francesco-saponaro/cagnotte",
    live: "https://cagnotte-francesco-saponaro.netlify.app",
    year: 2026,
    image: {
      src: "/work/cagnotte.webp",
      alt: "Cagnotte's back-office dashboard: sales with no click, open claims, margin by shop and a reconciliation that balances.",
    },
  },
  {
    slug: "stix-lens",
    name: "STIX Lens",
    summary:
      "See what is inside a threat-intelligence bundle before you import it: the objects, the ATT&CK techniques each intrusion set covers, and the references that will break on import.",
    stack: ["React", "TanStack Router", "TanStack Query", "Vite", "Tailwind"],
    repo: "https://github.com/francesco-saponaro/stix-lens",
    live: "https://stix-lens.netlify.app",
    year: 2026,
    image: {
      src: "/work/stix-lens.webp",
      alt: "STIX Lens on a sample feed: object counts, ATT&CK coverage by intrusion set and the problems to fix before importing.",
    },
  },
  {
    slug: "allotment-desk",
    name: "Allotment Desk",
    summary:
      "The rooms and spa slots a hotel group releases to a marketplace, six weeks ahead: which dates are full, which are going unsold, and the bookings behind each one.",
    stack: ["Next.js", "React", "TanStack Query", "Tailwind"],
    repo: "https://github.com/francesco-saponaro/allotment-desk",
    live: "https://allotment-desk.netlify.app",
    year: 2026,
    image: {
      src: "/work/allotment-desk.webp",
      alt: "Allotment Desk's six-week grid: released and sold rooms by offer and date across three hotels.",
    },
  },
];
