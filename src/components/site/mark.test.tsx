import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { F_PATH, FsMark, S_PATH } from "./mark";

describe("the mark", () => {
  it("draws the two initials on a mint tile and stays out of the accessibility tree", () => {
    const { container } = render(<FsMark className="big" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("mark", "big");
    const paths = Array.from(container.querySelectorAll("path")).map((p) => p.getAttribute("d"));
    expect(paths).toEqual([F_PATH, S_PATH]);
    expect(container.querySelector("rect")).toHaveAttribute("fill", "currentColor");
  });
});
