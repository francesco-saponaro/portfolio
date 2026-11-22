import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// next/font needs the Next compiler; the tests only need the class names.
vi.mock("next/font/google", () => ({
  Instrument_Sans: () => ({ variable: "font-instrument", className: "font-instrument" }),
}));
vi.mock("next/font/local", () => ({
  default: () => ({ variable: "font-archivo", className: "font-archivo" }),
}));

// jsdom has no canvas, media queries or intersection observer; the robot and
// the reveals check for them and simply stay still.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement["getContext"];
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
if (!("IntersectionObserver" in window)) {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", { value: IO, writable: true });
}
if (!("MutationObserver" in window)) {
  class MO {
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "MutationObserver", { value: MO, writable: true });
}
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb) => window.setTimeout(() => cb(performance.now()), 16);
  window.cancelAnimationFrame = (id) => window.clearTimeout(id);
}
if (!Element.prototype.animate) {
  Element.prototype.animate = (() => ({ cancel() {}, onfinish: null })) as unknown as Element["animate"];
}
