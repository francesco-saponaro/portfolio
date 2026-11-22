"use client";

import { useEffect, useRef } from "react";
import { ARROW, BLOCK, digits, ENVELOPE, EYES, FACE, HAPPY_EYES, type Cell } from "./dotmatrix";

// The page's companion: a small dot-matrix creature made of the dust that
// drifts behind the page. It gathers out of the nearest dust when the page
// opens, gives dots back when a shape needs fewer, and follows the visitor from dock to dock ([data-bot] elements nearest
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
// On the first visit the dust gathers from all over the screen into the face.
// The face glows and gives off dust, more when the pointer moves; the pointer
// stirs the dust like wind, fast dots streak, close ones are large and soft.
// A click sends a ring through the dust, and a click on the face makes it
// burst and gather again, pleased. Scrolling drags the dust along, and on a
// long jump the companion falls apart and forms again out of the dust at its
// next place. On a phone the dust leans with the phone. A small dot trails a
// mouse pointer: a ring over things to click, a point over text. The
// companion is drawn with a
// "difference" blend, so it stays white on the dark page
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
    /** Whether the pointer is a mouse (the trailing dot is only for a mouse). */
    let mouse = false;
    /** What is under the mouse: something to click, text, or neither. */
    let hover: "link" | "text" | "none" = "none";
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      mouse = e.pointerType === "mouse";
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };
    const onOver = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      hover = el?.closest("a, button, [role=tab], summary, label, input")
        ? "link"
        : el?.closest("p, h1, h2, h3, li, dd, dt, figcaption, blockquote")
          ? "text"
          : "none";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // A phone's tilt leans the dust (where the browser gives it without asking).
    const tilt = { x: 0, y: 0 };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt.x = clamp(e.gamma / 30, -1, 1);
      tilt.y = clamp((e.beta - 45) / 30, -1, 1);
    };
    if (small) window.addEventListener("deviceorientation", onTilt, { passive: true });

    // One set of dots for the whole page. Free dots are the dust drifting
    // behind the content; the companion recruits the nearest free dots for
    // each shape it takes and lets them go again when it needs fewer, so it
    // is always made of the background it came out of.
    const COUNT = small ? 150 : 340;
    const parts = Array.from({ length: COUNT }, () => {
      // Depth: most dust is small and far; one in ten is close, big and soft.
      const near = Math.random() < 0.1;
      const d = near ? 0.9 + Math.random() * 0.1 : 0.15 + Math.random() * 0.7;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0,
        vy: 0,
        d,
        near,
        r0: near ? 3 + Math.random() * 4 : 0.6 + d * 1.4,
        r: 0,
        a: 0,
        c: DUST[(Math.random() * DUST.length) | 0]!,
        tw: Math.random() * Math.PI * 2,
        k: 0.1 + Math.random() * 0.05,
        body: false,
        /** Left out on a slow machine. */
        off: false,
      };
    });
    /** The companion's dots, in the order of the shape's cells. */
    const members: number[] = [];
    const figure = digits(document.querySelector(".zb .figures dt")?.textContent?.trim() || "399");
    const STIR = small ? 150 : 230;
    const cursor = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0 };
    let emit = 0;

    let dock: HTMLElement | null = null;
    let target: Target = { mode: "face", x: W * 0.75, y: H * 0.45, s: 300, side: 0 };
    const p = { x: W * 0.75, y: H * 0.45, vx: 0, vy: 0, s: 300 };
    const greeted = new Set<HTMLElement>();
    let happyUntil = 0;
    let blinkAt = performance.now() + 1800;
    let t0 = performance.now();
    document.documentElement.classList.add("zb-robot");

    // The opening: for a moment there is only dust, then it gathers from all
    // over the screen into the face, slowly, and the face blinks and breathes
    // out a puff of dust. Skipped when the page opens further down.
    const opening = !reduced && window.scrollY < H * 0.5;
    const introUntil = opening ? t0 + 900 : 0;
    let gatherWide = opening;
    let slowUntil = 0;
    let burstAt = 0;
    /** While set, the companion stays apart: it has just burst or jumped. */
    let scatterUntil = 0;
    /** Rings sent through the dust by clicks. */
    const waves: { x: number; y: number; t: number }[] = [];
    let scrollY = window.scrollY;
    let scrollV = 0;
    let ring = 4;
    let lite = false;
    let timed = 0;
    let timeSum = 0;

    /** Lets the companion's dots go, flying outwards from its middle. */
    const scatter = (power: number, drift = 0) => {
      for (const i of members) {
        const d = parts[i]!;
        d.body = false;
        const a = Math.atan2(d.y - p.y, d.x - p.x) + (Math.random() - 0.5) * 0.7;
        const sp = power * (0.4 + Math.random());
        d.vx += Math.cos(a) * sp;
        d.vy += Math.sin(a) * sp + drift;
        d.a = 1;
      }
      members.length = 0;
    };
    const faceRadius = () => clamp(p.s * 0.085, 7, small ? 14 : 30) * 5.6;
    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      const now = performance.now();
      waves.push({ x: e.clientX, y: e.clientY, t: now });
      if (waves.length > 4) waves.shift();
      if (target.mode === "face" && members.length && Math.hypot(e.clientX - p.x, e.clientY - p.y) < faceRadius()) {
        scatter(small ? 5 : 8);
        scatterUntil = now + 650;
        happyUntil = now + 650 + 1700;
      }
    };
    window.addEventListener("pointerdown", onDown, { passive: true });

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
        isEye(x, y) ? { x: cx + x * pitch, y: cy + y * pitch, a: 1, r: pitch * 0.42 } : { x: cx + x * pitch, y: cy + y * pitch, a: 0.72, r: pitch * 0.3 },
      );
    };

    const frame = (now: number) => {
      if (!alive) return;
      const spent = now - t0;
      const dt = clamp(spent / 16.67, 0, 2.2);
      t0 = now;
      const time = now / 1000;

      // A slow machine: after the opening, measure two seconds of frames and,
      // if they run long, draw half the dust.
      if (!lite && now > introUntil + 2000 && timed < 120) {
        timed++;
        timeSum += spent;
        if (timed === 120 && timeSum / timed > 24) {
          lite = true;
          parts.forEach((d, i) => {
            if (i % 2) d.off = true;
          });
        }
      }

      // Scrolling drags the dust along, the near dust more.
      const sy = window.scrollY;
      const ds = sy - scrollY;
      scrollY = sy;
      scrollV += (ds - scrollV) * 0.35;

      if (pointer.active) {
        pointer.sx += (pointer.x / W - pointer.sx) * 0.05 * dt;
        pointer.sy += (pointer.y / H - pointer.sy) * 0.05 * dt;
      }

      // Where to be, and what.
      const found = findTarget(W, H, small, dock);
      // A long jump: fall apart here and form again there, out of the dust.
      if (
        !reduced &&
        members.length &&
        (found.dock !== dock || found.t.mode !== target.mode) &&
        Math.hypot(found.t.x - p.x, found.t.y - p.y) > H * 0.35
      ) {
        scatter(2.2, -clamp(scrollV, -30, 30) * 0.15);
        p.x = found.t.x;
        p.y = found.t.y;
        p.vx = p.vy = 0;
        if (found.t.s) p.s = found.t.s;
        scatterUntil = Math.max(scatterUntil, now + 240);
      }
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
        const n = Math.min(90, Math.floor((r.width - 24) / step) + 1);
        const sweep = reduced ? 0.5 : (Math.sin(time * 0.9) + 1) / 2;
        const ly = r.top + 20 + sweep * (r.height - 40);
        const trail = Math.cos(time * 0.9) >= 0 ? -1 : 1;
        for (let i = 0; i < n; i++) goals.push({ x: r.left + 12 + i * step, y: ly, a: 1, r: 2.4, tight: true });
        for (let i = 0; i < Math.ceil(n / 2); i++) goals.push({ x: r.left + 12 + i * 2 * step, y: ly + trail * step, a: 0.35, r: 1.8, tight: true });
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
        goals = face(cx, cy, target.mode === "corner" ? 6 : clamp(p.s * 0.085, 7, small ? 14 : 30), now);
      }

      if (now < introUntil || now < scatterUntil) goals = [];

      // Recruit the nearest free dots, or release the extra ones. The first
      // time, they come from anywhere on the screen.
      while (members.length > goals.length) {
        const i = members.pop()!;
        const d = parts[i]!;
        d.body = false;
      }
      if (members.length < goals.length && gatherWide) {
        gatherWide = false;
        const free = parts.map((d, i) => i).filter((i) => !parts[i]!.body && !parts[i]!.near);
        for (let k = free.length - 1; k > 0; k--) {
          const j = (Math.random() * (k + 1)) | 0;
          [free[k], free[j]] = [free[j]!, free[k]!];
        }
        for (const i of free) {
          if (members.length >= goals.length) break;
          parts[i]!.body = true;
          members.push(i);
        }
        slowUntil = now + 1500;
        burstAt = now + 1450;
        blinkAt = now + 1700;
      }
      if (members.length < goals.length) {
        const free = parts
          .map((d, i) => ({ i, dist: d.body ? Infinity : (d.x - cx) ** 2 + (d.y - cy) ** 2 }))
          .filter((f) => f.dist < Infinity)
          .sort((m, n) => m.dist - n.dist);
        for (const f of free) {
          if (members.length >= goals.length) break;
          parts[f.i]!.body = true;
          members.push(f.i);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dctx.clearRect(0, 0, W, H);

      // The pointer's own speed, smoothed, and a small dot that trails it.
      if (pointer.active) {
        if (cursor.px < -999) {
          cursor.px = pointer.x;
          cursor.py = pointer.y;
          cursor.x = pointer.x;
          cursor.y = pointer.y;
        }
        cursor.vx += (pointer.x - cursor.px - cursor.vx) * 0.3;
        cursor.vy += (pointer.y - cursor.py - cursor.vy) * 0.3;
        cursor.px = pointer.x;
        cursor.py = pointer.y;
        cursor.x += (pointer.x - cursor.x) * Math.min(1, 0.22 * dt);
        cursor.y += (pointer.y - cursor.y) * Math.min(1, 0.22 * dt);
      } else {
        cursor.vx *= 0.9;
        cursor.vy *= 0.9;
      }
      const stirSpeed = Math.hypot(cursor.vx, cursor.vy);

      // A soft halo behind the face, the light it gives off.
      const glowing = target.mode === "face" && members.length > 40;
      if (glowing) {
        const R = clamp(p.s * 0.085, 7, small ? 14 : 30) * 9;
        const breathe = 0.85 + 0.15 * Math.sin(time * 1.6);
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        halo.addColorStop(0, `rgba(255,255,255,${(0.11 * breathe).toFixed(3)})`);
        halo.addColorStop(0.45, `rgba(255,255,255,${(0.04 * breathe).toFixed(3)})`);
        halo.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = halo;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

        // The face gives off dust, more when the pointer moves: a free dot
        // leaves from inside the face, outwards, and joins the drift.
        if (!reduced) {
          emit += dt * (0.18 + Math.min(2.5, stirSpeed * 0.06));
          if (burstAt && now > burstAt) {
            emit += 26;
            burstAt = 0;
          }
          const size = R / 9 * 5;
          while (emit >= 1) {
            emit -= 1;
            const free = parts[(Math.random() * COUNT) | 0]!;
            if (free.body || free.near || free.off) continue;
            const ang = Math.random() * Math.PI * 2;
            const at = Math.random() * size;
            free.x = cx + Math.cos(ang) * at;
            free.y = cy + Math.sin(ang) * at;
            const sp = (1.5 + Math.random() * 3.5) * (0.6 + free.d);
            free.vx = Math.cos(ang) * sp;
            free.vy = Math.sin(ang) * sp;
            free.a = 1;
          }
        }
      }

      // The click rings: drawn faintly, each pushing the dust it passes.
      for (let w = waves.length - 1; w >= 0; w--) {
        if (now - waves[w]!.t > 1100) waves.splice(w, 1);
      }
      for (const w of waves) {
        const age = Math.max(0, now - w.t) / 1100;
        ctx.globalAlpha = 0.16 * (1 - age);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w.x, w.y, age * 1000, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const push = (d: { x: number; y: number; vx: number; vy: number }, f: number) => {
        for (const w of waves) {
          const age = Math.max(0, now - w.t) / 1100;
          const dx = d.x - w.x;
          const dy = d.y - w.y;
          const dist = Math.hypot(dx, dy) || 1;
          const off = Math.abs(dist - age * 1000);
          if (off < 70) {
            const k = (1 - off / 70) * (1 - age) * f * dt;
            d.vx += (dx / dist) * k;
            d.vy += (dy / dist) * k;
          }
        }
      };

      // The dust: a slow upward drift with some sway; the pointer stirs it
      // like wind, along its path and in a swirl around it. Fast dots draw as
      // short streaks, close ones as large soft discs.
      for (const d of parts) {
        if (d.body || d.off) continue;
        if (!reduced) {
          const tvx = Math.sin(time * 0.3 + d.tw) * 0.12 * d.d + tilt.x * 0.9 * d.d;
          const tvy = -0.22 * d.d + tilt.y * 0.9 * d.d;
          d.y -= ds * 0.18 * d.d;
          d.vy -= clamp(scrollV, -40, 40) * 0.0025 * d.d * dt;
          if (waves.length) push(d, 1.6);
          d.vx += (tvx - d.vx) * 0.015 * dt;
          d.vy += (tvy - d.vy) * 0.015 * dt;
          if (STIR && pointer.active) {
            const dx = d.x - pointer.x;
            const dy = d.y - pointer.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < STIR) {
              const f = (1 - dist / STIR) ** 2 * d.d;
              d.vx += cursor.vx * f * 0.09 * dt;
              d.vy += cursor.vy * f * 0.09 * dt;
              const swirl = Math.min(6, stirSpeed) * f * 0.05 * dt;
              d.vx += (-dy / dist) * swirl;
              d.vy += (dx / dist) * swirl;
              if (dist < 60) {
                d.vx += (dx / dist) * (1 - dist / 60) * 0.6 * dt;
                d.vy += (dy / dist) * (1 - dist / 60) * 0.6 * dt;
              }
            }
          }
          d.vx *= Math.pow(0.975, dt);
          d.vy *= Math.pow(0.975, dt);
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          if (d.y < -20) {
            d.y = H + 20;
            d.x = Math.random() * W;
          } else if (d.y > H + 30) d.y = -20;
          if (d.x < -30) d.x = W + 30;
          else if (d.x > W + 30) d.x = -30;
        }
        const speed = Math.hypot(d.vx, d.vy);
        const twinkle = 0.3 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.3 + d.tw));
        const goalA = d.near ? 0.16 : Math.min(1, twinkle + speed * 0.08);
        d.a += (goalA - d.a) * (now < introUntil + 400 ? 0.02 : 0.04) * dt;
        d.r += (d.r0 - d.r) * 0.1 * dt;
        if (d.near && !lite) {
          const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 2);
          g.addColorStop(0, `rgba(255,255,255,${d.a.toFixed(3)})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(d.x - d.r * 2, d.y - d.r * 2, d.r * 4, d.r * 4);
          continue;
        }
        ctx.globalAlpha = Math.min(1, d.a);
        if (speed > 1.1 && !reduced) {
          const len = Math.min(26, speed * 3.2);
          ctx.strokeStyle = speed > 2 ? "#ffffff" : d.c;
          ctx.lineWidth = Math.max(0.8, d.r * 1.5);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - (d.vx / speed) * len, d.y - (d.vy / speed) * len);
          ctx.stroke();
        } else {
          ctx.fillStyle = d.c;
          ctx.beginPath();
          ctx.arc(d.x, d.y, Math.max(0.4, d.r), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // The companion: every member dot to its cell in the shape.
      dctx.fillStyle = "#ffffff";
      members.forEach((i, n) => {
        const d = parts[i]!;
        const g = goals[n]!;
        if (reduced) {
          d.x = g.x;
          d.y = g.y;
          d.a = g.a;
          d.r = g.r;
        } else if (g.tight && Math.hypot(g.x - d.x, g.y - d.y) < 24) {
          // Close enough: lock onto the line so it stays straight as it sweeps.
          d.x += (g.x - d.x) * Math.min(1, 0.5 * dt);
          d.y = g.y;
          d.vx = d.vy = 0;
          d.a += (g.a - d.a) * 0.12 * dt;
          d.r += (g.r - d.r) * 0.2 * dt;
        } else {
          const slow = now < slowUntil;
          const k = slow ? d.k * 0.22 : d.k;
          const damp = slow ? 0.9 : 0.74;
          if (waves.length) push(d, 0.8);
          d.vx = (d.vx + (g.x - d.x) * k * dt) * Math.pow(damp, dt);
          d.vy = (d.vy + (g.y - d.y) * k * dt) * Math.pow(damp, dt);
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.a += (g.a - d.a) * 0.12 * dt;
          d.r += (g.r - d.r) * 0.2 * dt;
        }
        const alpha = Math.min(1, Math.max(0, d.a));
        if (glowing && d.r > 3) {
          dctx.globalAlpha = alpha * 0.14;
          dctx.beginPath();
          dctx.arc(d.x, d.y, d.r * 2.4, 0, Math.PI * 2);
          dctx.fill();
        }
        dctx.globalAlpha = alpha;
        dctx.beginPath();
        dctx.arc(d.x, d.y, Math.max(0.5, d.r), 0, Math.PI * 2);
        dctx.fill();
      });
      dctx.globalAlpha = 1;

      // The small dot that trails a mouse: a ring over things to click, a
      // point over text.
      if (mouse && pointer.active && !reduced) {
        const goalR = hover === "link" ? 20 : hover === "text" ? 1.6 : 4;
        ring += (goalR - ring) * Math.min(1, 0.22 * dt);
        if (ring > 6) {
          dctx.strokeStyle = "#ffffff";
          dctx.lineWidth = 1.5;
          dctx.beginPath();
          dctx.arc(cursor.x, cursor.y, ring, 0, Math.PI * 2);
          dctx.stroke();
        } else {
          dctx.beginPath();
          dctx.arc(cursor.x, cursor.y, ring, 0, Math.PI * 2);
          dctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Nothing runs while the tab is hidden.
    const onVisible = () => {
      cancelAnimationFrame(raf);
      if (document.hidden) return;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("deviceorientation", onTilt);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("visibilitychange", onVisible);
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
