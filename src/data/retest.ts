// Retest, the flagship, told as a short case study. Every number here comes
// from the real scan in the Retest repo (lab/real-run) and its test suite.

export const RETEST = {
  title: "Retest",
  lead: "A vulnerability-assessment workbench. Scanner output goes in, one list of findings comes out, and each finding is walked to a report.",
  body: "Scanners like Nmap, ZAP or Trivy each write their own format, repeat each other and raise false alarms. Retest reads six of them, merges what they agree on, recomputes every score with the official CVSS formula, and walks each finding through the six phases of an assessment. Nothing counts as verified until a person adds evidence of their own.",
  live: "https://retest-francesco-saponaro.netlify.app",
  repo: "https://github.com/francesco-saponaro/retest",
  realRun: "https://github.com/francesco-saponaro/retest/tree/main/lab/real-run",
  stack: ["TypeScript", "Fastify", "PostgreSQL", "Drizzle", "zod", "React 19", "TanStack Router", "TanStack Query", "Vite", "Docker"],
} as const;

export const RETEST_FIGURES: Array<{ value: string; text: string }> = [
  { value: "399", text: "findings from a real scan of OWASP Juice Shop, run on my laptop" },
  { value: "5", text: "scanners in that run: Nmap, Nuclei, ZAP, Trivy and Semgrep" },
  { value: "235", text: "duplicates merged: 634 raw results became 399 findings, every source kept" },
  { value: "569", text: "tests: every parser, the CVSS maths, the API on a real PostgreSQL" },
];

export const RETEST_SCREENS: Array<{ id: string; label: string; caption: string; src: string; alt: string }> = [
  {
    id: "assessment",
    label: "The assessment",
    caption: "The real scan, in phase 3 of 6: 399 findings on 4 assets, and none counts until a person has checked it.",
    src: "/work/retest-overview.webp",
    alt: "Retest's assessment page for the real Juice Shop scan: the six phases, 399 findings by severity, and plain explanations under each section.",
  },
  {
    id: "by-tool",
    label: "What each scanner found",
    caption: "Each scanner looks at a different side of the target: Nmap the machine, Nuclei and ZAP the website, Semgrep the code, Trivy the image.",
    src: "/work/retest-bytool.webp",
    alt: "The section showing each scanner's most serious findings, from an open port to SQL injection in the login code.",
  },
  {
    id: "findings",
    label: "The findings",
    caption: "One list for all five tools, most severe first, with filters by tool, asset, phase and OWASP category.",
    src: "/work/retest-findings.webp",
    alt: "The findings list: critical CVEs in the Juice Shop image at the top, with severity, CVSS score, phase, tool and OWASP category.",
  },
  {
    id: "finding",
    label: "One finding",
    caption: "A finding moves on only with evidence a person captured. The CVSS score is recomputed from the vector, never taken on trust.",
    src: "/work/retest-finding.webp",
    alt: "A single finding: its place in the six phases, the seven fields a report needs, and the CVSS calculator.",
  },
];

export const RETEST_STEPS: Array<{ title: string; text: string }> = [
  { title: "Read", text: "A parser for each tool's own format: Nmap's XML, Nuclei's JSON lines, ZAP's and Trivy's JSON, Semgrep's SARIF, Prowler's OCSF." },
  { title: "Normalise", text: "Every result becomes one finding with the same seven fields, on the asset it was found on, checked against the written scope." },
  { title: "Merge", text: "When two tools report the same problem on the same asset, it becomes one finding with two sources, not two lines to read." },
  { title: "Score", text: "The CVSS score is recomputed from the vector, the finding is tagged with its OWASP category, and anything unchecked is flagged." },
];
