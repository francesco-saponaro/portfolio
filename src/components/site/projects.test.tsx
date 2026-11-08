import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Projects } from "./projects";
import type { Project } from "@/data/projects";

describe("the projects section", () => {
  it("renders the empty state with a link to GitHub when there are no projects", () => {
    render(<Projects projects={[]} />);
    const card = screen.getByTestId("projects-empty");
    expect(within(card).getByText("More soon.")).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "github.com/francesco-saponaro" })).toHaveAttribute("href", "https://github.com/francesco-saponaro");
  });

  it("renders one card per project, with its stack and links", () => {
    const projects: Project[] = [
      { slug: "a", name: "Alpha", summary: "First one.", stack: ["Next.js", "SQL"], repo: "https://github.com/francesco-saponaro/alpha", live: "https://alpha.example", year: 2026 },
      { slug: "b", name: "Beta", summary: "Second one.", stack: ["Expo"], year: 2025 },
    ];
    render(<Projects projects={projects} />);
    expect(screen.queryByTestId("projects-empty")).toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByText("SQL")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Code/ })).toHaveAttribute("href", projects[0].repo);
    expect(screen.getByRole("link", { name: /Live/ })).toHaveAttribute("href", projects[0].live);
    expect(screen.getByText("02 · 2025")).toBeInTheDocument();
  });
});
