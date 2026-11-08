"use client";

import { useEffect, useId, useRef } from "react";
import { shapeMarkup, type ShapeName } from "./shapes";

// The section icons as solid glossy shapes that melt into one another. Each
// shape is the same SVG as the particle version, cut with a mask and filled
// with a mint gradient; a goo filter (blur + alpha threshold) blends the old
// and the new shape while they cross-fade, so a change looks liquid, and a
// specular light that follows the pointer gives the sheen. A shape morphs
// when its data-shape changes (the pinned stories set it) and grows out of a
// drop the first time it scrolls into view.

const BLUR = 1.1;

function markup(name: string) {
  return name === "drop" ? `<circle cx="50" cy="52" r="22" fill="#fff"/>` : shapeMarkup(name, "#fff", "#000");
}

function layer(uid: string, k: number, name: string) {
  return `<g class="sl"><mask id="${uid}m${k}" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">${markup(name)}</mask><rect x="-10" y="-10" width="120" height="120" fill="url(#${uid}g)" mask="url(#${uid}m${k})"/></g>`;
}

function svgMarkup(uid: string, name: string) {
  return `<defs><linearGradient id="${uid}g" gradientUnits="userSpaceOnUse" x1="14" y1="6" x2="86" y2="98"><stop offset="0" stop-color="#c8fff2"/><stop offset="0.3" stop-color="#5ff0d4"/><stop offset="0.64" stop-color="#1fc6aa"/><stop offset="1" stop-color="#0a6656"/></linearGradient><filter id="${uid}f" filterUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="${BLUR}" result="b"/><feColorMatrix in="b" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9" result="goo"/><feGaussianBlur in="goo" stdDeviation="2.6" result="bump"/><feSpecularLighting in="bump" surfaceScale="5" specularConstant="0.95" specularExponent="24" lighting-color="#ffffff" result="spec"><fePointLight x="24" y="6" z="72"/></feSpecularLighting><feComposite in="spec" in2="goo" operator="in" result="lit"/><feComposite in="goo" in2="lit" operator="arithmetic" k1="0" k2="1" k3="0.8" k4="0"/></filter></defs><g class="sl-wrap" filter="url(#${uid}f)">${layer(uid, 0, name)}</g>`;
}

// One pointer listener for every solid shape on screen: it tilts them and
// moves their light.
interface Live {
  el: HTMLElement;
  light: SVGFEPointLightElement | null;
}
const visible = new Set<Live>();
const ptr = { x: 0, y: 0 };
let listening = false;
let tickRaf = 0;
function tick() {
  tickRaf = 0;
  const W = window.innerWidth;
  const H = window.innerHeight;
  for (const s of visible) {
    const r = s.el.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (ptr.x - (r.left + r.width / 2)) / (W * 0.5)));
    const ny = Math.max(-1, Math.min(1, (ptr.y - (r.top + r.height / 2)) / (H * 0.5)));
    s.el.style.setProperty("--ry", `${(nx * 14).toFixed(2)}deg`);
    s.el.style.setProperty("--rx", `${(-ny * 10).toFixed(2)}deg`);
    s.light?.setAttribute("x", (50 + nx * 55).toFixed(1));
    s.light?.setAttribute("y", (22 + ny * 45).toFixed(1));
  }
}
function listen() {
  if (listening || window.matchMedia("(pointer: coarse)").matches) return;
  listening = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      if (!tickRaf) tickRaf = requestAnimationFrame(tick);
    },
    { passive: true }
  );
}

export function SolidShape({ shape, className, story }: { shape: ShapeName; className?: string; story?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = `s${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const el = ref.current;
    const svg = el?.querySelector("svg");
    const wrap = svg?.querySelector<SVGGElement>(".sl-wrap");
    const blur = svg?.querySelector("feGaussianBlur");
    if (!el || !svg || !wrap || !blur) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = el.dataset.shape ?? shape;
    let k = 1;
    let pulse = 0;

    const morph = (name: string) => {
      if (name === current) return;
      current = name;
      if (reduced) {
        wrap.innerHTML = layer(uid, k++, name);
        return;
      }
      const olds = Array.from(wrap.querySelectorAll<SVGGElement>(".sl"));
      wrap.insertAdjacentHTML("beforeend", layer(uid, k++, name));
      const nu = wrap.lastElementChild as SVGGElement;
      nu.animate(
        [
          { transform: "scale(0.42) rotate(-14deg)", opacity: 0 },
          { transform: "scale(1.07) rotate(2deg)", opacity: 1, offset: 0.62 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 860, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "both" }
      );
      for (const o of olds) {
        const a = o.animate(
          [
            { transform: "none", opacity: 1 },
            { transform: "scale(0.5) rotate(12deg)", opacity: 0 },
          ],
          { duration: 520, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" }
        );
        a.onfinish = () => o.remove();
      }
      // The melt: blur up so the two shapes run together, then set again.
      const t0 = performance.now();
      const run = ++pulse;
      const step = (now: number) => {
        if (run !== pulse) return;
        const p = Math.min(1, (now - t0) / 860);
        blur.setAttribute("stdDeviation", (BLUR + Math.sin(Math.PI * Math.min(1, p * 1.25)) * 5.2).toFixed(2));
        if (p < 1) requestAnimationFrame(step);
        else blur.setAttribute("stdDeviation", String(BLUR));
      };
      requestAnimationFrame(step);
      window.dispatchEvent(new CustomEvent("zb-morph"));
    };

    const mo = new MutationObserver(() => {
      const name = el.dataset.shape;
      if (name) morph(name);
    });
    mo.observe(el, { attributes: true, attributeFilter: ["data-shape"] });

    // Off screen at load: start as a drop and grow into the shape on arrival.
    const r = el.getBoundingClientRect();
    let entering = !reduced && (r.top > window.innerHeight || r.bottom < 0);
    if (entering) {
      wrap.innerHTML = layer(uid, k++, "drop");
      current = "drop";
    }
    const live: Live = { el, light: svg.querySelector("fePointLight") };
    listen();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(live);
          else visible.delete(live);
          if (entering && e.intersectionRatio >= 0.35) {
            entering = false;
            morph(el.dataset.shape ?? shape);
          }
        }
      },
      { threshold: [0, 0.35] }
    );
    io.observe(el);
    return () => {
      mo.disconnect();
      io.disconnect();
      visible.delete(live);
      pulse++;
    };
  }, [shape, uid]);

  return (
    <div ref={ref} className={`solid${className ? ` ${className}` : ""}`} data-shape={shape} data-story-anchor={story ? "" : undefined} aria-hidden="true">
      <svg viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: svgMarkup(uid, shape) }} />
    </div>
  );
}
