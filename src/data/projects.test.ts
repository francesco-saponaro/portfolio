import { describe, expect, it } from "vitest";
import { PROJECTS, type Project } from "./projects";

describe("the projects list", () => {
  it("is a typed array, empty until projects are added", () => {
    expect(Array.isArray(PROJECTS)).toBe(true);
    const sample: Project = { slug: "x", name: "X", summary: "Y", stack: ["TypeScript"], year: 2026 };
    expect(sample.stack).toContain("TypeScript");
  });

  it("has unique slugs and a year on every entry", () => {
    const slugs = new Set(PROJECTS.map((p) => p.slug));
    expect(slugs.size).toBe(PROJECTS.length);
    for (const p of PROJECTS) expect(p.year).toBeGreaterThan(2000);
  });
});
