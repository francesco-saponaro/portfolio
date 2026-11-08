import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Home } from "./home";
import { NAV_LINKS } from "./frame";

describe("the page", () => {
  it("has a section for every nav link, and the hero buttons point at sections too", () => {
    const { container } = render(<Home />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href") ?? "")
      .filter((h) => h.startsWith("#"));
    expect(hrefs).toEqual(NAV_LINKS.map((l) => l.href));
    for (const h of [...hrefs, "#work", "#contact", "#content", "#top"]) {
      expect(container.querySelector(h), `${h} should exist`).not.toBeNull();
    }
    const hero = screen.getByRole("heading", { level: 1 });
    expect(hero).toHaveTextContent("Francesco Saponaro.");
    expect(within(nav).getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/francesco-saponaro");
  });

  it("mentions the contact details once each in the contact section", () => {
    render(<Home />);
    const contact = screen.getByRole("region", { name: "Say hello." });
    expect(within(contact).getByRole("link", { name: /francescosaponaro5@gmail.com/ })).toHaveAttribute("href", "mailto:francescosaponaro5@gmail.com");
    expect(within(contact).getByRole("link", { name: "linkedin.com/in/francesco-saponaro87" })).toHaveAttribute("href", "https://www.linkedin.com/in/francesco-saponaro87");
  });

  it("gives the robot a dock in every section", () => {
    const { container } = render(<Home />);
    const sections = Array.from(container.querySelectorAll("main > section"));
    expect(sections.length).toBe(7);
    for (const s of sections) expect(s.querySelector("[data-bot]"), `${s.id || s.className} needs a dock`).not.toBeNull();
  });
});
