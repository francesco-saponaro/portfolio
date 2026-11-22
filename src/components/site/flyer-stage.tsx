"use client";

import { useEffect, useRef, useState } from "react";

// The page's flying companion, in two versions to compare: a drop of liquid
// silver ("mercury") made of the same material as the section shapes, and a
// creature made of the dust itself ("dots"). Both follow the visitor down the
// page from dock to dock ([data-bot] elements, nearest the middle of the
// screen) and change what they do with the section:
//
//   hero, statement, work, about   hover, wobble, point at the content
//   Retest's screens               become a scanning line that sweeps them
//   Retest's figures (dots only)   spell the first figure
//   projects                       split into small droplets / clusters
//   contact                        melt into the paper plane / spell "@"
//
// Which one runs comes from the address: ?flyer=mercury (the default) or
// ?flyer=dots. The dust canvas behind the page is drawn here too.

type Kind = "mercury" | "dots";
type Mode = "float" | "point" | "scan" | "figure" | "split" | "contact" | "corner";

const DUST = ["#ffffff", "#c9c9c6", "#8a8a88", "#5a5a58"];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

interface Target {
  mode: Mode;
  x: number;
  y: number;
  /** A size for the companion here, in pixels. */
  s: number;
  side: number;
  rect?: DOMRect;
}

function readKind(): Kind {
  const k = new URLSearchParams(window.location.search).get("flyer");
  return k === "dots" ? "dots" : "mercury";
}

// Where to go and what to be, from what is in the middle of the screen.
function findTarget(kind: Kind, W: number, H: number, small: boolean, prev: HTMLElement | null): { t: Target; dock: HTMLElement | null } {
  const mid = H * 0.5;
  const centred = (el: Element | null) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.top < mid + H * 0.12 && r.bottom > mid - H * 0.12 && r.width > 0 ? r : null;
  };
  const shot = centred(document.querySelector(".zb .screens-frame"));
  if (shot) return { t: { mode: "scan", x: shot.left, y: shot.top, s: 60, side: 0, rect: shot }, dock: null };
  const figs = kind === "dots" ? centred(document.querySelector(".zb .figures")) : null;
  if (figs) {
    // Spell the figure in the free space beside the run's heading, where the dock is.
    const spot = document.querySelector(".zb .retest-bot")?.getBoundingClientRect();
    const r = spot && spot.width > 0 ? spot : figs;
    return { t: { mode: "figure", x: r.left + r.width / 2, y: r.top + r.height / 2, s: 60, side: 0, rect: r }, dock: null };
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
  if (!dock) {
    const s = small ? 60 : 84;
    return { t: { mode: "corner", x: W - s * 0.8, y: H - s * 0.8, s, side: 0 }, dock: null };
  }
  const r = dock.getBoundingClientRect();
  const section = dock.closest("section, footer");
  const id = section?.id ?? "";
  const side = dock.dataset.bot === "left" ? -1 : dock.dataset.bot === "right" ? 1 : 0;
  let mode: Mode = side ? "point" : "float";
  if (id === "projects") mode = "split";
  if (id === "contact") mode = "contact";
  let x = r.left + r.width / 2;
  let y = r.top + r.height / 2;
  let rect: DOMRect | undefined;
  if (mode === "contact") {
    const plane = section?.querySelector(".cta-shape");
    if (plane) {
      rect = plane.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
  }
  return { t: { mode, x, y, s: r.width, side, rect }, dock };
}

// ---------- Shapes as clouds of points, for the dots ----------

/** Even points in the unit disk (a sunflower). */
function disk(n: number): Array<[number, number]> {
  return Array.from({ length: n }, (_, i) => {
    const r = Math.sqrt((i + 0.5) / n);
    const a = i * 2.39996;
    return [r * Math.cos(a), r * Math.sin(a)] as [number, number];
  });
}

/** Points that fill whatever `draw` paints, scaled to about -1..1 across. */
function sample(n: number, draw: (c: CanvasRenderingContext2D) => void): Array<[number, number]> {
  const W = 160;
  const H = 120;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d");
  if (!c) return disk(n);
  c.fillStyle = "#fff";
  c.strokeStyle = "#fff";
  draw(c);
  const data = c.getImageData(0, 0, W, H).data;
  const pts: Array<[number, number]> = [];
  for (let step = 6; step >= 1 && pts.length < n; step--) {
    pts.length = 0;
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 128) pts.push([(x - W / 2) / (W / 2), (y - H / 2) / (W / 2)]);
  }
  if (pts.length === 0) return disk(n);
  return Array.from({ length: n }, (_, i) => pts[Math.floor((i * pts.length) / n)]!);
}

// ---------- The component ----------

export function FlyerStage() {
  // Chosen in the browser after the first render, so the server's HTML and
  // the first client render agree.
  const [kind, setKind] = useState<Kind | null>(null);
  useEffect(() => setKind(readKind()), []);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const canvas = dustRef.current;
    if (!canvas || !kind) return;
    const ctx = canvas.getContext("2d");
    const dctx = dotsRef.current?.getContext("2d") ?? null;
    const svg = svgRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 760px)").matches;
    let alive = true;
    let raf = 0;
    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
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

    // ----- Mercury: a few circles and one bar melted together by a goo filter.
    const N_DROPS = 7;
    const drops = svg ? Array.from(svg.querySelectorAll<SVGCircleElement>("circle[data-drop]")) : [];
    const bar = svg?.querySelector<SVGRectElement>("rect[data-bar]") ?? null;
    const goo = svg?.querySelector<SVGFilterElement>("filter") ?? null;
    const drop = Array.from({ length: N_DROPS }, () => ({ x: W * 0.7, y: H * 1.2, r: 0, vx: 0, vy: 0 }));
    const barS = { x: 0, y: 0, w: 0, h: 0 };

    // ----- Dots: points that spring to the shape of the moment.
    const N_DOTS = small ? 70 : 96;
    const body = disk(N_DOTS - 2);
    const arrow = sample(N_DOTS, (c) => {
      c.beginPath();
      c.moveTo(150, 60);
      c.lineTo(100, 20);
      c.lineTo(100, 45);
      c.lineTo(14, 45);
      c.lineTo(14, 75);
      c.lineTo(100, 75);
      c.lineTo(100, 100);
      c.closePath();
      c.fill();
    });
    const figureText = document.querySelector(".zb .figures dt")?.textContent?.trim() || "399";
    const figure = sample(N_DOTS, (c) => {
      c.font = "800 92px Arial, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(figureText, 80, 64);
    });
    const at = sample(N_DOTS, (c) => {
      c.font = "700 110px Arial, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("@", 80, 62);
    });
    const dots = Array.from({ length: N_DOTS }, (_, i) => {
      const d = dust[i % dust.length]!;
      return { x: d.x * W, y: d.y * H, vx: 0, vy: 0, seed: Math.random() * Math.PI * 2, k: 0.05 + Math.random() * 0.05 };
    });

    let dock: HTMLElement | null = null;
    let target: Target = { mode: "float", x: W * 0.7, y: H * 0.5, s: 300, side: 0 };
    const p = { x: W * 0.7, y: H * 1.2, vx: 0, vy: 0, s: 200 };
    let blinkAt = performance.now() + 1500;
    let t0 = performance.now();
    document.documentElement.classList.add("zb-robot");

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
      if (ctx) {
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
      }

      const found = findTarget(kind, W, H, small, dock);
      dock = found.dock;
      target = found.t;

      // The anchor point springs to the target.
      if (reduced) {
        p.x = target.x;
        p.y = target.y;
        p.s = target.s;
      } else {
        p.vx += (target.x - p.x) * 0.02 * dt;
        p.vy += (target.y - p.y) * 0.02 * dt;
        const damp = Math.pow(0.86, dt);
        p.vx *= damp;
        p.vy *= damp;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.s += (target.s - p.s) * 0.07 * dt;
      }
      const bob = reduced ? 0 : Math.sin(time * 2.1) * 6;

      if (kind === "mercury" && svg) {
        svg.classList.toggle("scanning", target.mode === "scan");
        const R = clamp(p.s * 0.2, 26, 72);
        const goals: Array<{ x: number; y: number; r: number }> = [];
        const cx = p.x;
        const cy = p.y + bob;
        let bx = cx;
        let by = cy;
        let bw = 0;
        let bh = 0;
        if (target.mode === "scan" && target.rect) {
          // A thin silver line sweeping down the screenshot, the drop riding its left end.
          const r = target.rect;
          const k = reduced ? 0.5 : (Math.sin(time * 0.9) + 1) / 2;
          const ly = r.top + 18 + k * (r.height - 36);
          bw = r.width;
          bh = 14;
          bx = r.left;
          by = ly - bh / 2;
          goals.push({ x: r.left - 4, y: ly, r: 16 });
          for (let i = 1; i < N_DROPS; i++) goals.push({ x: r.left + (r.width * i) / N_DROPS, y: ly, r: 0 });
        } else if (target.mode === "split") {
          // Small droplets around the dock, each on its own slow orbit.
          goals.push({ x: cx, y: cy, r: Math.max(16, R * 0.6) });
          for (let i = 1; i < N_DROPS; i++) {
            const a = (i / (N_DROPS - 1)) * Math.PI * 2 + time * 0.5;
            const rr = Math.max(46, R * 2.1) + Math.sin(time * 1.7 + i) * 8;
            goals.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * 0.75, r: Math.max(10, R * 0.3) + 2 * Math.sin(time * 2 + i) });
          }
        } else if (target.mode === "contact" && target.rect) {
          // Melt into the paper plane: shrink to nothing at its centre.
          const near = Math.hypot(target.x - p.x, target.y - p.y) < 60;
          for (let i = 0; i < N_DROPS; i++) goals.push({ x: cx + (i ? Math.cos(i) * 8 : 0), y: cy + (i ? Math.sin(i) * 8 : 0), r: near ? 0 : (i ? R * 0.3 : R) });
        } else if (target.mode === "point" && target.side) {
          // A teardrop that sharpens into an arrow towards the content.
          const dir = target.side;
          const breathe = reduced ? 0 : Math.sin(time * 2.4) * 0.08;
          goals.push({ x: cx, y: cy, r: R });
          for (let i = 1; i < N_DROPS; i++) {
            const f = i / (N_DROPS - 1);
            goals.push({ x: cx + dir * R * (0.6 + f * (1.9 + breathe)), y: cy, r: R * (0.78 - f * 0.68) });
          }
        } else {
          // Float: a round drop whose small drops trail the motion and wobble inside.
          const sp = Math.hypot(p.vx, p.vy) || 1;
          const tx = -p.vx / sp;
          const ty = -p.vy / sp;
          const trail = clamp(sp * 1.6, 0, R * 1.8);
          goals.push({ x: cx, y: cy, r: R });
          for (let i = 1; i < N_DROPS; i++) {
            const f = i / (N_DROPS - 1);
            const a = time * (1.2 + i * 0.3) + i * 1.9;
            const wob = reduced ? 0 : R * 0.32;
            goals.push({
              x: cx + tx * trail * f + Math.cos(a) * wob,
              y: cy + ty * trail * f + Math.sin(a) * wob,
              r: R * (0.62 - f * 0.3),
            });
          }
          if (target.mode === "corner") goals.forEach((g) => (g.r *= 0.8));
        }
        for (let i = 0; i < N_DROPS; i++) {
          const d = drop[i]!;
          const g = goals[i]!;
          const k = i === 0 ? 0.22 : 0.12 + i * 0.012;
          if (reduced) {
            d.x = g.x;
            d.y = g.y;
            d.r = g.r;
          } else {
            d.vx = (d.vx + (g.x - d.x) * k * dt) * Math.pow(0.72, dt);
            d.vy = (d.vy + (g.y - d.y) * k * dt) * Math.pow(0.72, dt);
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.r += (g.r - d.r) * 0.14 * dt;
          }
          const el = drops[i];
          el?.setAttribute("cx", d.x.toFixed(1));
          el?.setAttribute("cy", d.y.toFixed(1));
          el?.setAttribute("r", Math.max(0, d.r).toFixed(1));
        }
        const ease = reduced ? 1 : 0.16 * dt;
        barS.x += (bx - barS.x) * ease;
        barS.y += (by - barS.y) * ease;
        barS.w += (bw - barS.w) * ease;
        barS.h += (bh - barS.h) * ease;
        if (bar) {
          bar.setAttribute("x", barS.x.toFixed(1));
          bar.setAttribute("y", barS.y.toFixed(1));
          bar.setAttribute("width", Math.max(0, barS.w).toFixed(1));
          bar.setAttribute("height", Math.max(0, barS.h).toFixed(1));
        }
        // Keep the filter's work to the box around the drop and the line.
        if (goo) {
          let x0 = Math.min(barS.x, ...drop.map((d) => d.x - d.r));
          let y0 = Math.min(barS.y, ...drop.map((d) => d.y - d.r));
          let x1 = Math.max(barS.x + barS.w, ...drop.map((d) => d.x + d.r));
          let y1 = Math.max(barS.y + barS.h, ...drop.map((d) => d.y + d.r));
          if (barS.w < 2) {
            x0 = Math.min(...drop.map((d) => d.x - d.r));
            y0 = Math.min(...drop.map((d) => d.y - d.r));
            x1 = Math.max(...drop.map((d) => d.x + d.r));
            y1 = Math.max(...drop.map((d) => d.y + d.r));
          }
          goo.setAttribute("x", (x0 - 30).toFixed(0));
          goo.setAttribute("y", (y0 - 30).toFixed(0));
          goo.setAttribute("width", (x1 - x0 + 60).toFixed(0));
          goo.setAttribute("height", (y1 - y0 + 60).toFixed(0));
          const light = goo.querySelector("fePointLight");
          light?.setAttribute("x", (drop[0]!.x - R * 0.6 + (pointer.sx - 0.5) * 80).toFixed(0));
          light?.setAttribute("y", (drop[0]!.y - R * 0.9 + (pointer.sy - 0.5) * 60).toFixed(0));
        }
      }

      if (kind === "dots" && dctx) {
        dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dctx.clearRect(0, 0, W, H);
        const R = clamp(p.s * 0.22, 32, 72);
        const cx = p.x;
        const cy = p.y + bob;
        const goals: Array<[number, number]> = [];
        let eyes = false;
        if (target.mode === "scan" && target.rect) {
          // A line of dots sweeping the screenshot, with a faint grid trailing it.
          const r = target.rect;
          const k = reduced ? 0.5 : (Math.sin(time * 0.9) + 1) / 2;
          const ly = r.top + 18 + k * (r.height - 36);
          const line = Math.floor(N_DOTS * 0.6);
          for (let i = 0; i < N_DOTS; i++) {
            if (i < line) goals.push([r.left + (r.width * (i + 0.5)) / line, ly]);
            else {
              const j = i - line;
              const cols = 12;
              goals.push([r.left + (r.width * ((j % cols) + 0.5)) / cols, ly - 14 - Math.floor(j / cols) * 14]);
            }
          }
        } else if (target.mode === "figure" && target.rect) {
          const size = 70;
          for (const [x, y] of figure) goals.push([target.x + x * size, target.y + y * size]);
        } else if (target.mode === "contact") {
          for (const [x, y] of at) goals.push([cx + x * R * 1.4, cy + y * R * 1.4]);
        } else if (target.mode === "split") {
          for (let i = 0; i < N_DOTS; i++) {
            const g = i % 4;
            const a = (g / 4) * Math.PI * 2 + time * 0.4;
            const [ux, uy] = body[i % body.length]!;
            goals.push([cx + Math.cos(a) * R * 1.9 + ux * R * 0.45, cy + Math.sin(a) * R * 1.4 + uy * R * 0.45]);
          }
        } else if (target.mode === "point" && target.side && Math.hypot(target.x - p.x, target.y - p.y) < 40) {
          for (const [x, y] of arrow) goals.push([cx + target.side * x * R * 1.2, cy + y * R * 1.2]);
        } else {
          eyes = true;
          const sq = 1 + (reduced ? 0 : Math.sin(time * 2.4) * 0.04);
          goals.push([0, 0], [0, 0]);
          for (const [x, y] of body) goals.push([cx + x * R * sq, cy + y * R / sq]);
          // Eyes look at the pointer.
          let lx = 0;
          let ly = 0;
          if (pointer.active) {
            const dx = pointer.x - cx;
            const dy = pointer.y - cy;
            const dd = Math.hypot(dx, dy) + R;
            lx = (dx / dd) * R * 0.18;
            ly = (dy / dd) * R * 0.14;
          }
          goals[0] = [cx - R * 0.32 + lx, cy - R * 0.12 + ly];
          goals[1] = [cx + R * 0.32 + lx, cy - R * 0.12 + ly];
        }
        if (now > blinkAt + 140) blinkAt = now + 2200 + Math.random() * 3000;
        const blink = now > blinkAt;
        for (let i = 0; i < N_DOTS; i++) {
          const d = dots[i]!;
          const [gx, gy] = goals[i]!;
          if (reduced) {
            d.x = gx;
            d.y = gy;
          } else {
            const jx = Math.sin(time * 1.6 + d.seed) * 1.2;
            const jy = Math.cos(time * 1.3 + d.seed) * 1.2;
            d.vx = (d.vx + (gx + jx - d.x) * d.k * dt) * Math.pow(0.8, dt);
            d.vy = (d.vy + (gy + jy - d.y) * d.k * dt) * Math.pow(0.8, dt);
            d.x += d.vx * dt;
            d.y += d.vy * dt;
          }
          const isEye = eyes && i < 2;
          const radius = isEye ? (blink ? 1 : clamp(R * 0.09, 3, 6)) : clamp(R * 0.045, 1.6, 2.8);
          dctx.globalAlpha = isEye ? 1 : target.mode === "scan" && i >= Math.floor(N_DOTS * 0.6) ? 0.25 : 0.8;
          dctx.fillStyle = "#ffffff";
          dctx.beginPath();
          if (isEye && blink) dctx.rect(d.x - 4, d.y - 0.8, 8, 1.6);
          else dctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
          dctx.fill();
        }
        dctx.globalAlpha = 1;
      }

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
  }, [kind]);

  return (
    <>
      <canvas ref={dustRef} className="stage" aria-hidden="true" />
      {kind === "dots" ? <canvas ref={dotsRef} className="stage dots-stage" aria-hidden="true" /> : null}
      {kind === "mercury" ? (
        <svg ref={svgRef} className="mercury-stage" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="hg-silver" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.35" stopColor="#cfcfcc" />
              <stop offset="0.7" stopColor="#6d6d6b" />
              <stop offset="1" stopColor="#262626" />
            </linearGradient>
            <filter id="hg-goo" filterUnits="userSpaceOnUse" x="0" y="0" width="10" height="10" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
              <feColorMatrix in="b" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9" result="goo" />
              <feGaussianBlur in="goo" stdDeviation="4" result="bump" />
              <feSpecularLighting in="bump" surfaceScale="6" specularConstant="1" specularExponent="22" lightingColor="#ffffff" result="spec">
                <fePointLight x="0" y="0" z="140" />
              </feSpecularLighting>
              <feComposite in="spec" in2="goo" operator="in" result="lit" />
              <feComposite in="goo" in2="lit" operator="arithmetic" k1="0" k2="1" k3="0.9" k4="0" />
            </filter>
          </defs>
          <g filter="url(#hg-goo)">
            <rect data-bar="" x="0" y="0" width="0" height="0" rx="3" fill="#bdbdba" />
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} data-drop={i} cx="-200" cy="-200" r="0" fill="url(#hg-silver)" />
            ))}
          </g>
        </svg>
      ) : null}
    </>
  );
}
