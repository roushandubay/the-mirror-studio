import type { Stage } from "@/lib/three/stage";
import type { SceneOptions } from "./types";

/**
 * Pigment dust that assembles into words.
 *
 * Thousands of particles in the studio's palette — magenta, rose, blush, a
 * little gold — drift as a loose cloud, then, as the visitor scrolls, gather
 * into each word in turn: "3", then "DAYS", and so on. The glyph shapes are
 * sampled from the site's own display face drawn into an offscreen canvas, so
 * the dust forms real Cormorant letterforms, not a generic font.
 *
 * Each particle leaves on its own small delay and swings out through depth on
 * the way, so a transition reads as powder being blown into shape rather than
 * points sliding in straight lines. The pointer pushes the dust aside.
 */

const PALETTE = ["#a10550", "#fa58a6", "#fdabd2", "#fbeff2", "#d9b27c", "#ffffff"];
const WEIGHTS = [0.24, 0.24, 0.2, 0.12, 0.12, 0.08];

export function mountParticles(stage: Stage, opts: SceneOptions) {
  const { THREE, scene, camera, host, pointer } = stage;
  const words = opts.words?.length ? opts.words : ["3", "DAYS"];
  // the viewport, not the canvas: on desktop this canvas is only half the
  // window wide, and must still get the desktop layout
  const mobile = window.innerWidth < 1024;
  const N = mobile ? 3200 : 7000;
  const MAX_DELAY = 0.35;

  camera.position.set(0, 0, 8);

  const visible = () => {
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    return { w: h * camera.aspect, h };
  };

  /* ------------------------ sample the word shapes ----------------------- */
  const family =
    getComputedStyle(document.documentElement).getPropertyValue("--font-cormorant").trim() ||
    "Georgia, serif";

  const sampleWord = (word: string): Float32Array => {
    const cw = 1600;
    const ch = 1000;
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const out = new Float32Array(N * 3);
    if (!ctx) return out;

    // Sampled from the semibold cut: the light weight's hairlines are too thin
    // to hold enough dust, and the shape reads as broken arcs.
    const font = (px: number) => `600 ${px}px ${family}`;
    ctx.font = font(100);
    const m = ctx.measureText(word);
    const w100 = m.width || 1;
    // Cormorant's numerals are old-style — they drop below the baseline — so
    // fit the real ink box, not the em box.
    const h100 = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || 70;
    const size = Math.floor(Math.min((cw * 0.9 * 100) / w100, (ch * 0.8 * 100) / h100));
    ctx.font = font(size);
    const mm = ctx.measureText(word);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(word, cw / 2, ch / 2 + (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2);

    const data = ctx.getImageData(0, 0, cw, ch).data;
    const step = 3;
    const pts: number[] = [];
    let minX = cw, maxX = 0, minY = ch, maxY = 0;
    for (let y = 0; y < ch; y += step) {
      for (let x = 0; x < cw; x += step) {
        if (data[(y * cw + x) * 4 + 3] > 140) {
          pts.push(x, y);
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (!pts.length) return out;

    // Fit the glyph box into the view: most of the height, never past the edges
    const view = visible();
    const bw = maxX - minX || 1;
    const bh = maxY - minY || 1;
    const scale = Math.min((view.w * (mobile ? 0.84 : 0.6)) / bw, (view.h * 0.5) / bh);
    // On desktop the copy sits to the left of these canvases, so the word is
    // right-aligned (8% margin, room for the pointer tilt) rather than centred
    // — it can never drift into the headline however narrow the window gets.
    const shiftX = mobile ? 0 : Math.max(0, (view.w * 0.84 - bw * scale) / 2);
    const cx = (minX + maxX) / 2 - shiftX / scale;
    const cy = (minY + maxY) / 2;
    const count = pts.length / 2;
    const jitter = step * scale * 0.6;

    for (let i = 0; i < N; i++) {
      const k = Math.floor(Math.random() * count) * 2;
      out[i * 3] = (pts[k] - cx) * scale + (Math.random() - 0.5) * jitter;
      out[i * 3 + 1] = -(pts[k + 1] - cy) * scale + (Math.random() - 0.5) * jitter;
      out[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
    }
    return out;
  };

  const cloud = (): Float32Array => {
    const view = visible();
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // a wide, flattened drift of dust with a denser core
      const r = Math.pow(Math.random(), 0.6);
      const a = Math.random() * Math.PI * 2;
      out[i * 3] = Math.cos(a) * r * view.w * 0.55;
      out[i * 3 + 1] = Math.sin(a) * r * view.h * 0.45;
      out[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return out;
  };

  let states: Float32Array[] = [];
  const build = () => {
    states = [cloud(), ...words.map(sampleWord)];
  };

  /* ------------------------------ geometry ------------------------------ */
  const position = new Float32Array(N * 3);
  const color = new Float32Array(N * 3);
  const size = new Float32Array(N);
  const seed = new Float32Array(N);
  const delay = new Float32Array(N);
  const swing = new Float32Array(N * 3);

  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    let r = Math.random();
    let idx = 0;
    while (idx < WEIGHTS.length - 1 && r > WEIGHTS[idx]) r -= WEIGHTS[idx++];
    c.set(PALETTE[idx]);
    color[i * 3] = c.r;
    color[i * 3 + 1] = c.g;
    color[i * 3 + 2] = c.b;
    size[i] = 0.6 + Math.pow(Math.random(), 3) * 2.2;
    seed[i] = Math.random();
    delay[i] = Math.random() * MAX_DELAY;
    swing[i * 3] = (Math.random() - 0.5) * 2.5;
    swing[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
    swing[i * 3 + 2] = 1.5 + Math.random() * 3.5;
  }

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(position, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", posAttr);
  geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uDpr: { value: stage.renderer.getPixelRatio() },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aSeed;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uDpr;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        // breathing: every grain wanders on its own slow orbit
        float s = aSeed * 6.2831;
        p += vec3(sin(uTime * 0.7 + s * 3.0), cos(uTime * 0.55 + s * 2.0), sin(uTime * 0.4 + s)) * 0.035;
        // the pointer blows the dust aside
        vec2 d = p.xy - uPointer;
        // a brush-sized gust, not a blast: the word stays legible around it
        float f = exp(-dot(d, d) * 5.0);
        p.xy += normalize(d + 1e-4) * f * 0.45;
        p.z += f * 0.6;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * uDpr * (26.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vColor = aColor;
        vAlpha = 0.55 + 0.45 * sin(uTime * (1.0 + aSeed * 2.0) + s * 7.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float core = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, core * core * vAlpha);
      }
    `,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  /* ------------------------------ lifecycle ----------------------------- */
  let ready = false;
  const init = () => {
    build();
    position.set(states[0]);
    posAttr.needsUpdate = true;
    ready = true;
  };

  // Wait for the display face so the dust forms Cormorant, not the fallback
  (document.fonts?.load(`600 100px ${family}`) ?? Promise.resolve())
    .catch(() => undefined)
    .then(init);

  let lastW = host.clientWidth;
  let lastH = host.clientHeight;

  const ease = (x: number) => x * x * (3 - 2 * x);

  stage.onFrame((t) => {
    mat.uniforms.uTime.value = t;
    if (!ready) return;

    // Re-sample when the canvas changes shape, so words always fit the frame
    if (Math.abs(host.clientWidth - lastW) > 40 || Math.abs(host.clientHeight - lastH) > 40) {
      lastW = host.clientWidth;
      lastH = host.clientHeight;
      build();
    }

    const view = visible();
    // park the repeller far off-stage until a real pointer is over the canvas
    if (pointer.active) mat.uniforms.uPointer.value.set((pointer.x * view.w) / 2, (pointer.y * view.h) / 2);
    else mat.uniforms.uPointer.value.set(999, 999);

    const last = states.length - 1;
    // Scroll-driven when given progress; otherwise ping-pong through the
    // states, holding each for a few seconds
    let s: number;
    if (opts.progress) {
      s = Math.min(last, Math.max(0, opts.progress() * last));
    } else {
      const period = Math.max(1, last * 2);
      const x = (t / 3.5) % period;
      s = x > last ? period - x : x;
    }

    const i0 = Math.min(last, Math.floor(s));
    const i1 = Math.min(last, i0 + 1);
    // hold on each shape, move between them
    const frac = ease(Math.min(1, Math.max(0, (s - i0 - 0.12) / 0.76)));
    const A = states[i0];
    const B = states[i1];

    for (let i = 0; i < N; i++) {
      const local = ease(Math.min(1, Math.max(0, (frac - delay[i]) / (1 - MAX_DELAY))));
      const arc = Math.sin(local * Math.PI);
      const j = i * 3;
      position[j] = A[j] + (B[j] - A[j]) * local + swing[j] * arc * 0.35;
      position[j + 1] = A[j + 1] + (B[j + 1] - A[j + 1]) * local + swing[j + 1] * arc * 0.35;
      position[j + 2] = A[j + 2] + (B[j + 2] - A[j + 2]) * local + swing[j + 2] * arc;
    }
    posAttr.needsUpdate = true;

    points.rotation.y = pointer.x * 0.12;
    points.rotation.x = -pointer.y * 0.08;
  });
}
