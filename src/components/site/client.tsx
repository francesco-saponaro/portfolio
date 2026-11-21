"use client";

import { useEffect, useRef, useState } from "react";

// Small client islands of the page: the entrances, the scroll-lit text, the
// pinned steps and the drag strip. Each renders its full content on the
// server, so the page reads without JavaScript.

// Entrances: elements with data-in rise once as they enter. The html gets
// .js-motion only here, so without script everything is simply visible.
export function Motion() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".zb [data-in]"));
    const vh = window.innerHeight;
    const below = els.filter((el) => el.getBoundingClientRect().top > vh * 0.92);
    document.documentElement.classList.add("js-motion");
    els.filter((el) => !below.includes(el)).forEach((el) => el.classList.add("in"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    below.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

// Words light up one by one as the paragraph crosses the screen.
export function LitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("span"));
    el.classList.add("lit-on");
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle("on", i < n));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <p ref={ref} className={`lit${className ? ` ${className}` : ""}`}>
      {words.map((w, i) => (
        <span key={i}>{w} </span>
      ))}
    </p>
  );
}

// Pinned stories: the step nearest the reading line is "on"; the shared
// square takes that step's shape and the counter says which step it is.
export function StoryWatcher({ id }: { id: string }) {
  useEffect(() => {
    const root = document.getElementById(id);
    if (!root) return;
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const anchor = root.querySelector<HTMLElement>("[data-story-anchor]");
    const count = root.querySelector<HTMLElement>("[data-story-count]");
    let raf = 0;
    let on = -1;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.55;
      let idx = 0;
      steps.forEach((s, i) => {
        if (s.getBoundingClientRect().top < line) idx = i;
      });
      if (idx === on) return;
      on = idx;
      steps.forEach((s, i) => s.classList.toggle("on", i === idx));
      if (anchor && steps[idx].dataset.step) anchor.dataset.shape = steps[idx].dataset.step;
      if (count) count.textContent = String(idx + 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [id]);
  return null;
}

// A horizontal strip that a mouse can drag (touch scrolls it natively).
export function DragStrip({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.classList.add("dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      down = false;
      el.classList.remove("dragging");
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);
  return (
    <div ref={ref} className="strip" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}

// Retest's screens: one large picture and a row of tabs. All the pictures are
// in the page from the start (the first one shown, the rest hidden), so the
// section reads and the first screen shows even without script; the tabs
// only choose which one is visible.
export function ScreenSwitcher({
  screens,
}: {
  screens: ReadonlyArray<{ id: string; label: string; caption: string; src: string; alt: string }>;
}) {
  const [on, setOn] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const choose = (i: number, focus = false) => {
    const n = (i + screens.length) % screens.length;
    setOn(n);
    if (focus) tabs.current[n]?.focus();
  };
  return (
    <div className="screens">
      <div className="screens-tabs" role="tablist" aria-label="Retest's screens">
        {screens.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${s.id}`}
            aria-selected={i === on}
            aria-controls={`screen-${s.id}`}
            tabIndex={i === on ? 0 : -1}
            className="screens-tab"
            onClick={() => choose(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                choose(i + 1, true);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                choose(i - 1, true);
              }
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="screens-frame">
        {screens.map((s, i) => (
          <figure
            key={s.id}
            id={`screen-${s.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${s.id}`}
            className={`screens-shot${i === on ? " on" : ""}`}
            hidden={i !== on}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.alt} width={1600} height={1000} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
            <figcaption>{s.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
