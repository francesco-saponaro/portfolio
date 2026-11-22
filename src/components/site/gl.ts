// Small WebGL helpers shared by the light and the bending pictures.

export function program(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram | null {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  };
  const v = make(gl.VERTEX_SHADER, vs);
  const f = make(gl.FRAGMENT_SHADER, fs);
  const p = gl.createProgram();
  if (!v || !f || !p) return null;
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

/** A WebGL context, or null where there is none (old browsers, tests). */
export function context(canvas: HTMLCanvasElement | null, opts: WebGLContextAttributes = {}): WebGLRenderingContext | null {
  if (!canvas) return null;
  try {
    return (canvas.getContext("webgl", { antialias: true, premultipliedAlpha: true, ...opts }) as WebGLRenderingContext | null) ?? null;
  } catch {
    return null;
  }
}
