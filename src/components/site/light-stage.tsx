"use client";

import { useEffect, useRef } from "react";
import { context, program } from "./gl";

// The ground behind the page, lit by a torch in the visitor's hand. The page
// is dark rock that only shows where the light falls: a bumpy surface made of
// noise, shaded by the light's direction, so the bumps catch it from the side
// and cast their own small shadows. The light trails the pointer a little, as a
// hand would, and the ground scrolls slower than the page, so it sits deeper.
// With no pointer (a phone) the light wanders slowly on its own. Drawn at half
// resolution; where WebGL is missing the plain dark background stays.

const VS = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS = `
precision mediump float;
uniform vec2 uRes;      // canvas size in device pixels
uniform float uScale;   // device pixels per CSS pixel
uniform vec2 uLight;    // light position, CSS pixels from the top left
uniform float uPower;
uniform float uScroll;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
// The ground's height: broad stones, then grit on top.
float ground(vec2 p){
  float stones = fbm(p);
  stones = smoothstep(0.35, 0.75, stones);
  return stones * 0.8 + fbm(p * 4.3) * 0.35;
}

void main(){
  vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale;
  vec2 world = css + vec2(0.0, uScroll * 0.45);
  vec2 p = world / 150.0;
  float e = 1.6 / 150.0;
  float h = ground(p);
  float hx = ground(p + vec2(e, 0.0));
  float hy = ground(p + vec2(0.0, e));
  vec3 n = normalize(vec3((h - hx) * 10.0, (h - hy) * 10.0, 1.0));

  vec3 L = vec3(uLight, 260.0);
  vec3 S = vec3(css, h * 26.0);
  vec3 ld = normalize(L - S);
  float diff = max(dot(n, ld), 0.0);
  float d = length(L.xy - S.xy);
  float spot = exp(-d * d / (2.0 * 165.0 * 165.0));
  float halo = exp(-d * d / (2.0 * 380.0 * 380.0)) * 0.12;

  float grit = fbm(p * 6.7 + 3.0);
  float albedo = 0.3 + 0.7 * grit * grit * 1.6;
  vec3 lightCol = vec3(1.0, 0.94, 0.86);
  vec3 col = vec3(0.039);
  col += lightCol * albedo * pow(diff, 2.4) * (spot + halo) * 0.5 * uPower;
  // Faint pale patches far from the light, so the ground is never quite black.
  col += vec3(0.010) * smoothstep(0.45, 0.85, fbm(p * 0.33 + 9.0)) * diff;
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

export function LightStage() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = context(canvas, { antialias: false, alpha: false });
    if (!canvas || !gl) return;
    const prog = program(gl, VS, FS);
    if (!prog) return;
    document.documentElement.classList.add("zb-light");

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(prog);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u("uRes");
    const uScale = u("uScale");
    const uLight = u("uLight");
    const uPower = u("uPower");
    const uScroll = u("uScroll");

    let W = 0;
    let H = 0;
    let scale = 0.5;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      canvas.width = Math.round(W * scale);
      canvas.height = Math.round(H * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: W * 0.62, y: H * 0.42, on: false };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
    };
    const onLeave = () => {
      pointer.on = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const light = { x: pointer.x, y: pointer.y, power: 0 };
    let raf = 0;
    let t0 = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(3, Math.max(0, (now - t0) / 16.67));
      t0 = now;
      const t = now / 1000;
      // The hand: a light that trails where it is pointed.
      const tx = pointer.on ? pointer.x : W * (0.5 + Math.sin(t * 0.21) * 0.32);
      const ty = pointer.on ? pointer.y : H * (0.45 + Math.cos(t * 0.17) * 0.22);
      const k = 1 - Math.pow(1 - 0.09, dt);
      light.x += (tx - light.x) * k;
      light.y += (ty - light.y) * k;
      light.power += ((pointer.on ? 1 : 0.7) - light.power) * (1 - Math.pow(1 - 0.03, dt));

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uScale, scale);
      gl.uniform2f(uLight, light.x, light.y);
      gl.uniform1f(uPower, light.power);
      gl.uniform1f(uScroll, window.scrollY);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", start);
      document.documentElement.classList.remove("zb-light");
    };
  }, []);

  return <canvas ref={ref} className="stage light-stage" aria-hidden="true" />;
}
