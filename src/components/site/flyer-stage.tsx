"use client";

import { useEffect, useRef } from "react";
import { ARROW, BLOCK, digits, ENVELOPE, EYES, FACE, HAPPY_EYES, type Cell } from "./dotmatrix";

// The page's companion: a small dot-matrix creature made of the same dust
// that drifts behind the page. It gathers from the dust when the page opens,
// then follows the visitor from dock to dock ([data-bot] elements nearest
// the middle of the screen) and changes with the section, always snapping its
// dots to an exact grid like an LED display:
//
//   resting                 a round face whose eyes follow the pointer, blink,
//                           and smile when it reaches a new dock
//   a dock that points      an arrow towards the content
//   Retest's screens        a line of dots sweeping the screenshot, like a scan
//   Retest's figures        the first figure, in a 5 × 7 dot font
//   projects                four small blocks circling
//   contact                 an envelope
//
// It is drawn with a "difference" blend, so it stays white on the dark page
// and turns dark over a light picture. With reduced motion it does not travel
// between shapes, it is simply there.

type Mode = "face" | "point" | "scan" | "figure" | "split" | "contact" | "corner";

interface Target {
  mode: Mode;
  x: number;
  y: number;
  /** The dock's width, which sets the size of the face. */
  s: number;
  side: number;
  rect?: DOMRect;
}

interface Goal {
  x: number;
  y: number;
  a: number;
  r: number;
  /** Held tight to the goal (the scan line), instead of the usual soft spring. */
  tight?: boolean;
}

const DUST = ["#ffffff", "#c9c9c6", "#8a8a88", "#5a5a58"];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function findTarget(W: number, H: number, small: boolean, prev: HTMLElement | null): { t: Target; dock: HTMLElement | null } {
  const mid = H * 0.5;
  const centred = (el: Element | null) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.top < mid + H * 0.12 && r.bottom > mid - H * 0.12 && r.width > 0 && r.height > 0 ? r : null;
  };
  const shot = centred(document.querySelector(".zb .screens-shot.on img"));
  if (shot) return { t: { mode: "scan", x: shot.left, y: shot.top, s: 0, side: 0, rect: shot }, dock: null };
  const figs = centred(document.querySelector(".zb .figures"));
  if (figs) {
    const spot = document.querySelector(".zb .retest-bot")?.getBoundingClientRect();
    const r = spot && spot.width > 0 ? spot : figs;
    return { t: { mode: "figure", x: r.left + r.width / 2, y: r.top + r.height / 2, s: 0, side: 0 }, dock: null };
  }

  let best: HTMLElement | null = null;
  let bestD = Infinity;
  let curD = Infinity;
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(".zb [data-bot]"))) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.bottom < H * 0.12 || r.top > H * 0.88) continue;
    const d = Math.abs(r.top + r.height / 2 - mid);
    if (el === prev) curD = d;
    if (d < bestD) {
      bestD = d;
      best = el;
    }
  }
  const dock = prev && curD < Infinity && curD - bestD < 80 ? prev : best;
  if (!dock) return { t: { mode: "corner", x: W - (small ? 44 : 64), y: H - (small ? 48 : 70), s: 0, side: 0 }, dock: null };
  const r = dock.getBoundingClientRect();
  const id = dock.closest("section, footer")?.id ?? "";
  const side = dock.dataset.bot === "left" ? -1 : dock.dataset.bot === "right" ? 1 : 0;
  let mode: Mode = side ? "point" : "face";
  if (id === "projects") mode = "split";
  if (id === "contact") mode = "contact";
  return { t: { mode, x: r.left + r.width / 2, y: r.top + r.height / 2, s: r.width, side }, dock };
}

export function FlyerStage() {
  const dustRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = dustRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    const dctx = dotsRef.current?.getContext("2d") ?? null;
    if (!canvas || !ctx || !dctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 760px)").matches;
    let alive = true;
    let raf = 0;
    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      for (const c of [canvas, dotsRef.current]) {
        if (!c) continue;
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: -9999, y: -9999, sx: 0.5, sy: 0.5, active: false };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const dust = Array.from({ length: small ? 60 : 150 }, () => ({
      x: Math.random(),
      y: Math.random(),
      d: 0.2 + Math.random() * 0.8,
      r: 0.6 + Math.random() * 1.6,
      c: DUST[(Math.random() * DUST.length) | 0]!,
      ox: 0,
      oy: 0,
      tw: Math.random() * Math.PI * 2,
    }));

    // The creature's dots start where the dust is, then gather.
    const POOL = 140;
    const dots = Array.from({ length: POOL }, (_, i) => {
      const d = dust[i % dust.length]!;
      return { x: d.x * W, y: d.y * H, vx: 0, vy: 0, a: 0, r: 1.5, k: 0.1 + Math.random() * 0.05 };
    });
    const figure = digits(document.querySelector(".zb .figures dt")?.textContent?.trim() || "399");

    let dock: HTMLElement | null = null;
    let target: Target = { mode: "face", x: W * 0.75, y: H * 0.45, s: 300, side: 0 };
    const p = { x: W * 0.75, y: H * 0.45, vx: 0, vy: 0, s: 300 };
    const greeted = new Set<HTMLElement>();
    let happyUntil = 0;
    let blinkAt = performance.now() + 1800;
    let t0 = performance.now();
    document.documentElement.classList.add("zb-robot");

    // A shape's cells on the screen at a pitch, in reading order.
    const place = (cells: Cell[], cx: number, cy: number, pitch: number, a: number, r: number, mirror = 1): Goal[] =>
      cells.map(([x, y]) => ({ x: cx + x * pitch * mirror, y: cy + y * pitch, a, r }));

    const face = (cx: number, cy: number, pitch: number, now: number): Goal[] => {
      const happy = now < happyUntil;
      const blink = !happy && now > blinkAt;
      // The eyes look towards the pointer, one cell at most.
      let lx = 0;
      let ly = 0;
      if (pointer.active) {
        lx = clamp(Math.round((pointer.x - cx) / 160), -1, 1);
        ly = clamp(Math.round((pointer.y - cy) / 220), -1, 1);
      } else if (target.side) lx = target.side;
      const eyes: Cell[] = happy ? HAPPY_EYES : EYES.map(([x, y]) => [x + lx, y + ly] as Cell).filter(([, y]) => !blink || y === ly);
      const isEye = (x: number, y: number) => eyes.some(([ex, ey]) => ex === x && ey === y);
      return FACE.map(([x, y]) =>
        isEye(x, y) ? { x: cx + x * pitch, y: cy + y * pitch, a: 1, r: pitch * 0.42 } : { x: cx + x * pitch, y: cy + y * pitch, a: 0.4, r: pitch * 0.28 },
      );
    };

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min(2.2, (now - t0) / 16.67);
      t0 = now;
      const time = now / 1000;

      if (pointer.active) {
        pointer.sx += (pointer.x / W - pointer.sx) * 0.05 * dt;
        pointer.sy += (pointer.y / H - pointer.sy) * 0.05 * dt;
      }

      // Dust.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const d of dust) {
        if (!reduced) {
          d.y -= 0.00006 * d.d * dt;
          d.x += Math.sin(time * 0.2 + d.tw) * 0.00004 * dt;
          if (d.y < -0.02) d.y = 1.02;
        }
        let x = d.x * W + (pointer.sx - 0.5) * -40 * d.d;
        let y = d.y * H + (pointer.sy - 0.5) * -40 * d.d;
        const dx = x + d.ox - pointer.x;
        const dy = y + d.oy - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && !reduced) {
          const dd = Math.sqrt(d2) || 1;
          const f = (1 - dd / 130) * 3.2;
          d.ox += (dx / dd) * f * dt;
          d.oy += (dy / dd) * f * dt;
        }
        d.ox *= 0.94;
        d.oy *= 0.94;
        x += d.ox;
        y += d.oy;
        ctx.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.3 + d.tw));
        ctx.fillStyle = d.c;
        ctx.beginPath();
        ctx.arc(x, y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Where to be, and what.
      const found = findTarget(W, H, small, dock);
      dock = found.dock;
      target = found.t;
      if (reduced) {
        p.x = target.x;
        p.y = target.y;
        if (target.s) p.s = target.s;
      } else {
        p.vx = (p.vx + (target.x - p.x) * 0.02 * dt) * Math.pow(0.86, dt);
        p.vy = (p.vy + (target.y - p.y) * 0.02 * dt) * Math.pow(0.86, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (target.s) p.s += (target.s - p.s) * 0.07 * dt;
      }
      const arrived = Math.hypot(target.x - p.x, target.y - p.y) < 30;
      if (dock && arrived && !greeted.has(dock)) {
        greeted.add(dock);
        happyUntil = now + 1300;
      }
      if (now > blinkAt + 150) blinkAt = now + 2400 + Math.random() * 3000;
      const bob = reduced ? 0 : Math.round(Math.sin(time * 2.1) * 3);
      const cx = Math.round(p.x);
      const cy = Math.round(p.y) + bob;

      // The shape of the moment.
      let goals: Goal[] = [];
      const pitch = small ? 7 : 9;
      const big = small ? 2.2 : 2.8;
      if (target.mode === "scan" && target.rect) {
        // A line of dots sweeping the screenshot, a fainter row trailing it.
        const r = target.rect;
        const step = 12;
        const n = Math.min(POOL, Math.floor((r.width - 24) / step) + 1);
        const sweep = reduced ? 0.5 : (Math.sin(time * 0.9) + 1) / 2;
        const ly = r.top + 20 + sweep * (r.height - 40);
        const trail = Math.cos(time * 0.9) >= 0 ? -1 : 1;
        for (let i = 0; i < n; i++) goals.push({ x: r.left + 12 + i * step, y: ly, a: 1, r: 2.4, tight: true });
        for (let i = 0; i < Math.min(POOL - n, Math.ceil(n / 2)); i++) goals.push({ x: r.left + 12 + i * 2 * step, y: ly + trail * step, a: 0.35, r: 1.8, tight: true });
      } else if (target.mode === "figure") {
        goals = place(figure, cx, cy, pitch, 1, big);
      } else if (target.mode === "contact") {
        goals = place(ENVELOPE, cx, cy, pitch, 1, big);
      } else if (target.mode === "split") {
        for (let g = 0; g < 4; g++) {
          const a = (g / 4) * Math.PI * 2 + (reduced ? 0 : time * 0.45);
          goals.push(...place(BLOCK, Math.round(cx + Math.cos(a) * 46), Math.round(cy + Math.sin(a) * 34), 8, 0.9, 2.4));
        }
      } else if (target.mode === "point" && target.side && arrived && now > happyUntil) {
        goals = place(ARROW, cx, cy, pitch, 1, big, target.side);
      } else {
        goals = face(cx, cy, target.mode === "corner" ? 6 : clamp(p.s * 0.03, 7, 12), now);
      }

      // Every dot to its goal; spare dots fade where they are.
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dctx.clearRect(0, 0, W, H);
      dctx.fillStyle = "#ffffff";
      for (let i = 0; i < POOL; i++) {
        const d = dots[i]!;
        const g = goals[i];
        const gx = g ? g.x : cx;
        const gy = g ? g.y : cy;
        const ga = g ? g.a : 0;
        const gr = g ? g.r : 1;
        if (reduced) {
          d.x = gx;
          d.y = gy;
          d.a = ga;
          d.r = gr;
        } else if (g?.tight && Math.hypot(gx - d.x, gy - d.y) < 24) {
          // Close enough: lock onto the line so it stays straight as it sweeps.
          d.x += (gx - d.x) * Math.min(1, 0.5 * dt);
          d.y = gy;
          d.vx = d.vy = 0;
          d.a += (ga - d.a) * 0.12 * dt;
          d.r += (gr - d.r) * 0.2 * dt;
        } else {
          d.vx = (d.vx + (gx - d.x) * d.k * dt) * Math.pow(0.74, dt);
          d.vy = (d.vy + (gy - d.y) * d.k * dt) * Math.pow(0.74, dt);
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.a += (ga - d.a) * 0.12 * dt;
          d.r += (gr - d.r) * 0.2 * dt;
        }
        if (d.a < 0.02) continue;
        dctx.globalAlpha = Math.min(1, d.a);
        dctx.beginPath();
        dctx.arc(d.x, d.y, Math.max(0.5, d.r), 0, Math.PI * 2);
        dctx.fill();
      }
      dctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("zb-robot");
    };
  }, []);

  return (
    <>
      <canvas ref={dustRef} className="stage" aria-hidden="true" />
      <canvas ref={dotsRef} className="stage dots-stage" aria-hidden="true" />
    </>
  );
}
