import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Retest } from "./retest";
import { RETEST, RETEST_SCREENS } from "@/data/retest";

describe("the Retest section", () => {
  it("shows the first screen and switches with the tabs", () => {
    render(<Retest />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(RETEST_SCREENS.length);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("id", `screen-${RETEST_SCREENS[0].id}`);

    fireEvent.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByRole("img")).toHaveAttribute("src", RETEST_SCREENS[2].src);
    expect(within(panel).getByText(RETEST_SCREENS[2].caption)).toBeInTheDocument();
  });

  it("moves between screens with the arrow keys, wrapping at the ends", () => {
    render(<Retest />);
    const tabs = screen.getAllByRole("tab");
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(tabs[tabs.length - 1]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(tabs[tabs.length - 1], { key: "ArrowRight" });
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  });

  it("links to the demo, the code and the write-up of the real scan, and states its numbers", () => {
    render(<Retest />);
    expect(screen.getByRole("link", { name: /Open the demo/ })).toHaveAttribute("href", RETEST.live);
    expect(screen.getByRole("link", { name: /The code/ })).toHaveAttribute("href", RETEST.repo);
    expect(screen.getByRole("link", { name: /Every command/ })).toHaveAttribute("href", RETEST.realRun);
    expect(screen.getByText("399")).toBeInTheDocument();
    expect(screen.getByText("569")).toBeInTheDocument();
  });
});
