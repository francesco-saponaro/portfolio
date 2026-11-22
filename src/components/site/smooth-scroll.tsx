"use client";

import { useEffect } from "react";

// Weighted scrolling: the page glides to where the wheel sends it instead of
// jumping, which is what makes the bending pictures and the parallax read as
// one movement. The current speed is shared on window.__zbScroll for the
// canvases. With reduced motion the browser's own scrolling stays.
export interface ScrollState {
  /** Pixels moved in the last frame, signed (down is positive). */
  v: number;
}

declare global {
  interface Window {
    __zbScroll?: ScrollState;
  }
}

export function SmoothScroll() {
  useEffect(() => {
    const state: ScrollState = { v: 0 };
    window.__zbScroll = state;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let alive = true;
    let raf = 0;
    let destroy = () => {};
    import("lenis").then(({ default: Lenis }) => {
      if (!alive) return;
      const lenis = new Lenis({ lerp: 0.085, anchors: { offset: 0 }, wheelMultiplier: 0.9 });
      lenis.on("scroll", (l: { velocity: number }) => {
        state.v = l.velocity;
      });
      const tick = (time: number) => {
        lenis.raf(time);
        if (!lenis.isScrolling) state.v *= 0.9;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      destroy = () => lenis.destroy();
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      destroy();
    };
  }, []);
  return null;
}
