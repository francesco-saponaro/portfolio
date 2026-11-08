"use client";

import { useEffect, useRef } from "react";
import { RobotSvg } from "./robot";

// The flying robot and the drifting dust. The robot flies to whichever
// [data-bot] dock is nearest the middle of the screen, so it follows the
// visitor down the page: it lags behind the scroll on a spring, banks into
// the turn, burns its thruster harder when it climbs, watches the pointer,
// blinks, waves when it reaches a new dock, hops when a shape morphs and does
// a roll when clicked. With no dock on screen it waits in the bottom-right
// corner like a chat button (a click there goes to the contact section).

const DUST = ["#2fe0c4", "#ff7a45", "#7fb4ff", "#ffe071", "#a99bff"];
const BASE_W = 400;
const BASE_H = 460;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function RobotStage() {
  const dustRef = useRef<HTMLCanvasElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fly = flyRef.current;
    const canvas = dustRef.current;
    if (!fly || !canvas) return;
    const ctx = canvas.getContext("2d");
    const q = (n: string) => fly.querySelector<SVGGraphicsElement>(`[data-part="${n}"]`);
    const part = {
      root: q("root"),
      flame: q("flame"),
      armL: q("armL"),
      armR: q("armR"),
      face: q("face"),
      eyes: q("eyes"),
      eyeL: q("eyeL"),
      eyeR: q("eyeR"),
      happy: q("happy"),
      mouth: q("mouth"),
      stalk: q("stalk"),
      tip: q("tip"),
    };
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
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const dust = Array.from({ length: small ? 60 : 150 }, () => ({
      x: Math.random(),
      y: Math.random(),
      d: 0.2 + Math.random() * 0.8,
      r: 0.6 + Math.random() * 1.6,
      c: DUST[(Math.random() * DUST.length) | 0],
      ox: 0,
      oy: 0,
      tw: Math.random() * Math.PI * 2,
    }));

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
    window.addEventListener("blur", onLeave);

    // Robot state: position (centre, px), size (px wide), velocities.
    const p = { x: W * 0.72, y: H * 1.3, s: small ? 200 : 380 };
    const v = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    const arm = { l: 14, r: -14 };
    const tipLag = { x: 0, v: 0 };
    let dock: HTMLElement | null = null;
    let companion = false;
    let started = false;
    const greeted = new WeakSet<HTMLElement>();
    let waveUntil = 0;
    let rollAt = -1;
    let happyUntil = 0;
    let blinkAt = performance.now() + 1800;

    const choose = (): HTMLElement | null => {
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      let curD = Infinity;
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(".zb [data-bot]"))) {
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.bottom < H * 0.12 || r.top > H * 0.88) continue;
        const d = Math.abs(r.top + r.height / 2 - H * 0.5);
        if (el === dock) curD = d;
        if (d < bestD) {
          bestD = d;
          best = el;
        }
      }
      if (dock && curD < Infinity && curD - bestD < 80) return dock;
      return best;
    };

    const onMorph = () => {
      if (companion || reduced) return;
      v.y -= p.s * 0.035;
      happyUntil = performance.now() + 700;
    };
    window.addEventListener("zb-morph", onMorph);

    const onClick = () => {
      if (companion) {
        document.getElementById("contact")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        return;
      }
      if (reduced) return;
      if (rollAt < 0) rollAt = performance.now();
      happyUntil = performance.now() + 1500;
    };
    const onEnter = () => {
      if (!companion) waveUntil = Math.max(waveUntil, performance.now() + 1300);
    };
    fly.addEventListener("click", onClick);
    fly.addEventListener("pointerenter", onEnter);

    document.documentElement.classList.add("zb-robot");
    let t0 = performance.now();

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min(2.2, (now - t0) / 16.67);
      t0 = now;
      const time = now / 1000;

      if (pointer.active) {
        pointer.sx += (pointer.x / W - pointer.sx) * 0.05 * dt;
        pointer.sy += (pointer.y / H - pointer.sy) * 0.05 * dt;
      } else {
        pointer.sx += (0.5 - pointer.sx) * 0.02 * dt;
        pointer.sy += (0.5 - pointer.sy) * 0.02 * dt;
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

      // Where to fly.
      const next = choose();
      if (next !== dock) dock = next;
      let tx: number;
      let ty: number;
      let ts: number;
      if (dock) {
        const r = dock.getBoundingClientRect();
        tx = r.left + r.width / 2;
        ty = r.top + r.height / 2;
        ts = r.width;
        companion = false;
      } else {
        ts = small ? 58 : 92;
        tx = W - ts * 0.5 - (small ? 14 : 28);
        ty = H - ts * 0.58 - (small ? 18 : 30);
        companion = true;
      }
      if (!started) {
        started = true;
        p.x = tx + (reduced ? 0 : W * 0.08);
        p.y = reduced ? ty : ty + H * 0.75;
        p.s = ts;
        fly.classList.add("ready");
      }

      if (reduced) {
        p.x = tx;
        p.y = ty;
        p.s = ts;
        v.x = v.y = 0;
      } else {
        v.x += (tx - p.x) * 0.02 * dt;
        v.y += (ty - p.y) * 0.02 * dt;
        const damp = Math.pow(0.86, dt);
        v.x *= damp;
        v.y *= damp;
        p.x += v.x * dt;
        p.y += v.y * dt;
        p.s += (ts - p.s) * 0.07 * dt;
      }
      const speed = Math.hypot(v.x, v.y);
      const settled = Math.hypot(tx - p.x, ty - p.y) < Math.max(18, p.s * 0.25);
      if (dock && settled && !greeted.has(dock)) {
        greeted.add(dock);
        waveUntil = now + 1400;
      }
      fly.classList.toggle("hit", settled);

      // Body: bob, bank into the turn, stretch on a fast climb, roll on click.
      const bob = reduced ? 0 : Math.sin(time * 2.1) * p.s * 0.03;
      const sway = reduced ? 0 : Math.sin(time * 1.3) * p.s * 0.012;
      let rot = reduced ? 0 : clamp(v.x * 0.7, -24, 24) + Math.sin(time * 1.6) * 2.2;
      if (rollAt >= 0) {
        const k = (now - rollAt) / 900;
        if (k >= 1) rollAt = -1;
        else rot += 360 * (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      }
      const stretch = 1 + clamp(Math.abs(v.y) * 0.0035, 0, 0.07);
      const sc = p.s / BASE_W;
      fly.style.transform = `translate3d(${(p.x + sway - (BASE_W * sc) / 2).toFixed(1)}px, ${(p.y + bob - (BASE_H * sc) / 2).toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
      part.root?.setAttribute("transform", `rotate(${rot.toFixed(2)} 0 -10) scale(${(1 / Math.sqrt(stretch)).toFixed(3)} ${stretch.toFixed(3)})`);

      // Thruster: harder when climbing or moving fast.
      const burn = reduced ? 0.75 : 0.62 + clamp(speed * 0.045 + Math.max(0, -v.y) * 0.03, 0, 1.15);
      const flick = reduced ? 1 : 1 + Math.sin(time * 31) * 0.07 + Math.sin(time * 47) * 0.05;
      part.flame?.setAttribute("transform", `translate(0 80) scale(${(1 - (flick - 1) * 0.6).toFixed(3)} ${(burn * flick).toFixed(3)})`);

      // Eyes on the pointer (or on where it is going).
      const hx = p.x;
      const hy = p.y - p.s * 0.2;
      let lx: number;
      let ly: number;
      if (pointer.active) {
        const dx = pointer.x - hx;
        const dy = pointer.y - hy;
        const dist = Math.hypot(dx, dy) + p.s * 0.5;
        lx = (dx / dist) * 11;
        ly = (dy / dist) * 8;
      } else {
        lx = clamp(v.x * 0.6, -10, 10) + (reduced ? 0 : Math.sin(time * 0.7) * 3);
        ly = clamp(v.y * 0.35, -7, 7);
      }
      if (dock && settled && !pointer.active) {
        const side = dock.dataset.bot;
        if (side === "left") lx = -9;
        if (side === "right") lx = 9;
      }
      look.x += (lx - look.x) * 0.15 * dt;
      look.y += (ly - look.y) * 0.15 * dt;
      part.eyes?.setAttribute("transform", `translate(${look.x.toFixed(2)} ${look.y.toFixed(2)})`);
      part.face?.setAttribute("transform", `translate(${(look.x * 0.35).toFixed(2)} ${(look.y * 0.3).toFixed(2)})`);

      // Blink, or happy eyes.
      const happy = now < happyUntil || now < waveUntil;
      let lid = 1;
      if (!reduced) {
        if (now > blinkAt + 140) blinkAt = now + 2200 + Math.random() * 3200;
        if (now > blinkAt) lid = 0.12;
      }
      const eyeT = (cx: number) => `translate(${cx} -33) scale(1 ${lid}) translate(${-cx} 33)`;
      part.eyeL?.setAttribute("transform", eyeT(-19));
      part.eyeR?.setAttribute("transform", eyeT(19));
      part.eyeL?.setAttribute("opacity", happy ? "0" : "1");
      part.eyeR?.setAttribute("opacity", happy ? "0" : "1");
      part.happy?.setAttribute("opacity", happy ? "1" : "0");
      part.mouth?.setAttribute("d", happy ? "M-9-14Q0-4 9-14" : "M-7-13Q0-8 7-13");

      // Arms trail the flight; wave on arrival, point at the dock's side.
      let wl = 14 + clamp(v.x * 1.4, -35, 35) + clamp(v.y * 1.6, 0, 55);
      let wr = -14 + clamp(v.x * 1.4, -35, 35) - clamp(v.y * 1.6, 0, 55);
      if (!reduced) {
        wl += Math.sin(time * 2) * 4;
        wr -= Math.sin(time * 2) * 4;
      }
      const side = dock && settled ? dock.dataset.bot : "";
      if (side === "right") wr = -84 + Math.sin(time * 3) * 5;
      if (side === "left") wl = 84 - Math.sin(time * 3) * 5;
      if (now < waveUntil && !reduced) {
        if (side === "right") wl = 150 + Math.sin(time * 15) * 22;
        else wr = -150 + Math.sin(time * 15) * 22;
      }
      arm.l += (wl - arm.l) * 0.2 * dt;
      arm.r += (wr - arm.r) * 0.2 * dt;
      part.armL?.setAttribute("transform", `translate(-33 32) rotate(${arm.l.toFixed(1)})`);
      part.armR?.setAttribute("transform", `translate(33 32) rotate(${arm.r.toFixed(1)})`);

      // Antenna bends against the motion and springs back.
      if (!reduced) {
        tipLag.v += (clamp(-v.x * 0.9, -16, 16) - tipLag.x) * 0.16 * dt;
        tipLag.v *= Math.pow(0.8, dt);
        tipLag.x += tipLag.v * dt;
      }
      const bx = tipLag.x;
      const by = -107 + Math.abs(bx) * 0.18;
      part.stalk?.setAttribute("d", `M0-80Q${(bx * 0.15).toFixed(1)}-94 ${bx.toFixed(1)} ${(by + 3).toFixed(1)}`);
      part.tip?.setAttribute("cx", bx.toFixed(1));
      part.tip?.setAttribute("cy", by.toFixed(1));

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("zb-morph", onMorph);
      fly.removeEventListener("click", onClick);
      fly.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("zb-robot");
    };
  }, []);

  return (
    <>
      <canvas ref={dustRef} className="stage" aria-hidden="true" />
      <div ref={flyRef} className="flyer" aria-hidden="true">
        <RobotSvg idp="zbr" />
      </div>
    </>
  );
}
