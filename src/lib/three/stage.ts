import type * as ThreeNS from "three";

/**
 * The shared bootstrap every WebGL scene on the site runs on.
 *
 * A page can carry three or four scenes now, so the expensive parts are handled
 * once, here, rather than re-solved per component:
 *
 *  - **Paused off screen.** An IntersectionObserver stops the frame loop the
 *    moment a canvas leaves the viewport (with a margin, so it is already
 *    running when it scrolls back in). A tab in the background stops too.
 *  - **Sized by its host.** A ResizeObserver, not window resize, so a canvas in
 *    a pinned or animated box stays sharp.
 *  - **Pixel ratio capped at 2** — a 3x phone rendering at native density costs
 *    more than twice the fill rate for no visible gain behind glass and grain.
 *  - **Smoothed pointer.** Scenes read `pointer` (-1..1, eased) rather than raw
 *    mouse events, so every scene responds with the same weight.
 *
 * Three.js itself is imported dynamically by the caller and passed in, which
 * keeps it out of the server bundle entirely.
 */

export type Stage = {
  THREE: typeof ThreeNS;
  renderer: ThreeNS.WebGLRenderer;
  scene: ThreeNS.Scene;
  camera: ThreeNS.PerspectiveCamera;
  host: HTMLElement;
  /** eased pointer position over the host, -1..1 on each axis; `active` is
   *  false until the visitor actually moves a pointer, and after it leaves */
  pointer: { x: number; y: number; active: boolean };
  /** register the per-frame update; `t` = seconds running, `dt` = frame delta */
  onFrame: (fn: (t: number, dt: number) => void) => void;
  /** register extra teardown */
  onDispose: (fn: () => void) => void;
  dispose: () => void;
};

export function createStage(
  THREE: typeof ThreeNS,
  host: HTMLElement,
  {
    fov = 35,
    z = 6,
    exposure = 1.2,
    antialias = true,
    maxDpr = 2,
  }: { fov?: number; z?: number; exposure?: number; antialias?: boolean; maxDpr?: number } = {},
): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
  renderer.setSize(host.clientWidth || 1, host.clientHeight || 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, (host.clientWidth || 1) / (host.clientHeight || 1), 0.1, 200);
  camera.position.set(0, 0, z);

  const frames: ((t: number, dt: number) => void)[] = [];
  const disposers: (() => void)[] = [];

  /* ------------------------------ sizing ------------------------------ */
  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  /* ------------------------------ pointer ----------------------------- */
  const pointer = { x: 0, y: 0, active: false };
  const target = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    // touch "pointers" only exist mid-gesture; they would yank scenes around
    if (e.pointerType === "touch") return;
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    target.y = Math.max(-1, Math.min(1, -(((e.clientY - r.top) / r.height) * 2 - 1)));
    pointer.active =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  };
  const onLeave = (e: PointerEvent) => {
    if (!e.relatedTarget) {
      pointer.active = false;
      target.x = 0;
      target.y = 0;
    }
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("pointerout", onLeave);

  /* --------------------------- run / pause ---------------------------- */
  let visible = false;
  let raf = 0;
  // Plain timestamps (THREE.Clock is deprecated in r18x). `last` resets on
  // resume, so time spent paused off screen never arrives as one huge delta.
  let last = 0;
  let elapsed = 0;

  const tick = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
    last = now;
    elapsed += dt;
    // Framerate-independent ease toward the real pointer
    const k = 1 - Math.pow(0.001, dt);
    pointer.x += (target.x - pointer.x) * k;
    pointer.y += (target.y - pointer.y) * k;
    for (const fn of frames) fn(elapsed, dt);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (raf || !visible || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    },
    { rootMargin: "25% 0px" },
  );
  io.observe(host);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);

  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stop();
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("pointerout", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    for (const fn of disposers) fn();
    scene.traverse((obj) => {
      const mesh = obj as ThreeNS.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as ThreeNS.Material | ThreeNS.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    renderer.dispose();
    renderer.domElement.remove();
  };

  return {
    THREE,
    renderer,
    scene,
    camera,
    host,
    pointer,
    onFrame: (fn) => {
      frames.push(fn);
    },
    onDispose: (fn) => {
      disposers.push(fn);
    },
    dispose,
  };
}

/** True when the browser can actually give us a WebGL context. */
export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
