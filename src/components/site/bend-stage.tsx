"use client";

import { useEffect, useRef } from "react";
import { context, program } from "./gl";

// The screenshots as sheets of paper. Each picture marked [data-bend] is drawn
// again on one canvas over the page, on a fine mesh, and the real <img> is
// hidden but stays in place for layout, links and screen readers. A sheet
// rising from the bottom of the screen has its lower edge flared and curled
// towards you, catching a silver sheen where it bends; it flattens as it
// reaches the middle, and its top edge lifts a little as it leaves. Scrolling
// fast bends it more. The pictures wait in grey until their card is hovered,
// as before. Pictures inside a scrolling strip are clipped to the strip.
// With reduced motion, or without WebGL, the plain images stay.

const VS = `
attribute vec2 aUv;
uniform vec4 uRect;   // x, y, w, h in CSS pixels
uniform vec2 uView;   // viewport in CSS pixels
uniform float uBend;  // -1 (leaving at the top) .. 1 (rising from the bottom)
varying vec2 vUv;
varying float vSheen;
void main(){
  float s = uBend > 0.0 ? aUv.y : 1.0 - aUv.y;
  float k = smoothstep(0.2, 1.0, s);
  k *= k;
  float b = abs(uBend);
  vec2 pos = uRect.xy + aUv * uRect.zw;
  pos.x += (aUv.x - 0.5) * uRect.z * 0.34 * b * k;
  pos.y += sign(uBend) * uRect.w * 0.16 * b * k;
  pos.y -= sign(uBend) * sin(aUv.x * 3.14159) * uRect.w * 0.05 * b * k;
  vUv = aUv;
  vSheen = b * k;
  gl_Position = vec4(pos.x / uView.x * 2.0 - 1.0, 1.0 - pos.y / uView.y * 2.0, 0.0, 1.0);
}`;

const FS = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uSize;     // the sheet in CSS pixels
uniform vec2 uCrop;     // texture scale for object-fit: cover, anchored top left
uniform float uRadius;
uniform float uGrey;    // 1 = waiting in grey, 0 = in colour
uniform float uDim;     // how dark the grey is
uniform float uTime;
varying vec2 vUv;
varying float vSheen;
void main(){
  vec2 q = vUv * uSize;
  vec2 c = abs(q - uSize * 0.5) - (uSize * 0.5 - uRadius);
  float d = length(max(c, 0.0)) + min(max(c.x, c.y), 0.0) - uRadius;
  float a = clamp(0.5 - d, 0.0, 1.0);
  vec3 col = texture2D(uTex, vUv * uCrop).rgb;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(l) * uDim, uGrey);
  float band = 0.5 + 0.5 * sin(vUv.y * 11.0 + vUv.x * 5.0 - uTime * 1.6);
  col += vec3(0.95, 0.97, 1.0) * vSheen * (0.18 + 0.32 * band);
  col *= 1.0 - vSheen * 0.25 * (1.0 - band);
  gl_FragColor = vec4(col * a, a);
}`;

interface Sheet {
  img: HTMLImageElement;
  tex: WebGLTexture | null;
  ready: boolean;
  bend: number;
  grey: number;
  dim: number;
  hoverEl: Element | null;
  clipEl: Element | null;
  radius: number;
}

const N = 40;

export function BendStage() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = context(canvas, { alpha: true });
    if (!gl) return;
    const prog = program(gl, VS, FS);
    if (!prog) return;

    // A grid of N × N cells, as triangles.
    const uv: number[] = [];
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const a = [x / N, y / N];
        const b = [(x + 1) / N, y / N];
        const c = [x / N, (y + 1) / N];
        const d = [(x + 1) / N, (y + 1) / N];
        uv.push(...a, ...b, ...c, ...b, ...d, ...c);
      }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    gl.useProgram(prog);
    const aUv = gl.getAttribLocation(prog, "aUv");
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const U = {
      rect: u("uRect"),
      view: u("uView"),
      bend: u("uBend"),
      size: u("uSize"),
      crop: u("uCrop"),
      radius: u("uRadius"),
      grey: u("uGrey"),
      dim: u("uDim"),
      time: u("uTime"),
    };

    const upload = (s: Sheet) => {
      if (!s.img.complete || !s.img.naturalWidth) return;
      s.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, s.tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, s.img);
      s.ready = true;
    };

    const sheets: Sheet[] = Array.from(document.querySelectorAll<HTMLImageElement>(".zb img[data-bend]")).map((img) => {
      const s: Sheet = {
        img,
        tex: null,
        ready: false,
        bend: 0,
        grey: 1,
        dim: img.dataset.bend === "dim" ? 0.5 : 0.95,
        hoverEl: img.closest(".card, figure"),
        clipEl: img.closest(".strip"),
        radius: parseFloat(getComputedStyle(img).borderTopLeftRadius) || 0,
      };
      if (img.complete) upload(s);
      else img.addEventListener("load", () => upload(s), { once: true });
      // Lazy pictures must load before they come on screen.
      img.loading = "eager";
      return s;
    });
    if (!sheets.length) return;
    document.documentElement.classList.add("zb-bend");

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let t0 = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(3, Math.max(0, (now - t0) / 16.67));
      t0 = now;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.view, W, H);
      gl.uniform1f(U.time, now / 1000);
      const v = window.__zbScroll?.v ?? 0;

      for (const s of sheets) {
        const r = s.img.getBoundingClientRect();
        if (!s.ready || r.width < 2 || r.bottom < -H * 0.3 || r.top > H * 1.3) continue;
        // Where the sheet is: below the middle it bends up from its bottom edge,
        // above the middle a little from its top edge; speed adds to it.
        const p = (r.top + r.height / 2 - H / 2) / H;
        let goal = p > 0 ? Math.min(1, Math.max(0, (p - 0.05) / 0.45)) : -Math.min(0.55, Math.max(0, (-p - 0.15) / 0.55));
        goal += Math.max(-0.35, Math.min(0.35, v * 0.012));
        goal = Math.max(-1, Math.min(1, goal));
        s.bend += (goal - s.bend) * (1 - Math.pow(1 - 0.16, dt));
        const lit = s.hoverEl?.matches(":hover, :focus-within") ? 0 : 1;
        s.grey += (lit - s.grey) * (1 - Math.pow(1 - 0.1, dt));

        if (s.clipEl) {
          const c = s.clipEl.getBoundingClientRect();
          gl.enable(gl.SCISSOR_TEST);
          gl.scissor(Math.round(c.left * dpr), Math.round((H - c.bottom - 200) * dpr), Math.round(c.width * dpr), Math.round((c.height + 400) * dpr));
        } else gl.disable(gl.SCISSOR_TEST);

        const iw = s.img.naturalWidth;
        const ih = s.img.naturalHeight;
        const ea = r.width / r.height;
        const ia = iw / ih;
        gl.uniform2f(U.crop, ia > ea ? ea / ia : 1, ia > ea ? 1 : ia / ea);
        gl.uniform4f(U.rect, r.left, r.top, r.width, r.height);
        gl.uniform2f(U.size, r.width, r.height);
        gl.uniform1f(U.bend, s.bend);
        gl.uniform1f(U.radius, s.radius);
        gl.uniform1f(U.grey, s.grey);
        gl.uniform1f(U.dim, s.dim);
        gl.bindTexture(gl.TEXTURE_2D, s.tex);
        gl.drawArrays(gl.TRIANGLES, 0, N * N * 6);
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (document.hidden) return;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    };
    start();
    document.addEventListener("visibilitychange", start);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", start);
      document.documentElement.classList.remove("zb-bend");
    };
  }, []);

  return <canvas ref={ref} className="stage bend-stage" aria-hidden="true" />;
}
