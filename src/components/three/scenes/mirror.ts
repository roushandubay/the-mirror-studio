import type { Stage } from "@/lib/three/stage";
import type { SceneOptions } from "./types";

/**
 * The studio's mark as an object: a brushed-silver mirror box.
 *
 * The logo is already a brushed-metal plate with an engraved monogram, so it
 * becomes the front face of a rounded metal box; the back face is a true
 * mirror. The box turns continuously, slowing as each face comes round, so a
 * visitor sees the mark, then their room reflected in the mirror, then the mark
 * again — the name of the studio, made literal.
 *
 * Reflections are real (a room environment baked into a PMREM cubemap), a few
 * hundred specks of light orbit the box, and the pointer tilts it. This replaces
 * the lipstick everywhere except the homepage.
 */
export async function mountMirror(stage: Stage, opts: SceneOptions) {
  const { THREE, scene, camera, renderer, pointer } = stage;
  const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
  const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");

  renderer.toneMappingExposure = 1.35;
  const mobile = window.innerWidth < 1024;
  camera.position.set(0, 0, mobile ? 8 : 7);

  /* --------------------------- reflections ---------------------------- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  // The stock room is neutral grey, which made the mirror face read as a flat
  // grey card. Two glowing panels — studio rose and warm gold — are added to
  // the room before it is baked, so the mirror and the brushed edges catch
  // colour as they turn.
  const room = new RoomEnvironment();
  const addPanel = (color: string, intensity: number, pos: [number, number, number], size: [number, number]) => {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(size[0], size[1]),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
    );
    panel.position.set(...pos);
    panel.lookAt(0, 0, 0);
    room.add(panel);
  };
  addPanel(opts.accent ?? "#fa58a6", 6, [-9, 6, 4], [5, 9]);
  addPanel("#e3b27a", 5, [9, 3, 6], [4, 7]);
  const envRT = pmrem.fromScene(room, 0.04);
  scene.environment = envRT.texture;

  const key = new THREE.DirectionalLight(0xfff4ec, 1.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(opts.accent ?? "#fa58a6"), 0.8);
  rim.position.set(-4, 1, -3);
  scene.add(rim);

  /* ------------------------------- box -------------------------------- */
  const W = 2.3;
  const D = 0.42;
  const root = new THREE.Group();
  scene.add(root);
  const box = new THREE.Group();
  root.add(box);

  // Brushed, not polished: roughness near zero is what reads as CG chrome
  const body = new THREE.MeshPhysicalMaterial({
    color: 0xd9d3ce,
    metalness: 1,
    roughness: 0.3,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.2,
  });
  box.add(new THREE.Mesh(new RoundedBoxGeometry(W, W, D, 6, 0.16), body));

  const inset = W - 0.24;

  // Front: the studio's own logo plate
  const texture = await new THREE.TextureLoader().loadAsync(opts.texture ?? "/studio/logo-mark.jpg");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const face = new THREE.MeshPhysicalMaterial({
    map: texture,
    metalness: 0.45,
    roughness: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 0.85,
  });
  const front = new THREE.Mesh(new THREE.PlaneGeometry(inset, inset), face);
  front.position.z = D / 2 + 0.002;
  box.add(front);

  // Back: a true mirror
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.03,
    envMapIntensity: 1.5,
  });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(inset, inset), glass);
  back.position.z = -D / 2 - 0.002;
  back.rotation.y = Math.PI;
  box.add(back);

  // a hairline rose-gold bevel framing each face
  const bevel = new THREE.MeshPhysicalMaterial({ color: 0xe8b9a8, metalness: 1, roughness: 0.2, envMapIntensity: 1.3 });
  for (const z of [D / 2 + 0.001, -D / 2 - 0.001]) {
    const frame = new THREE.Mesh(new THREE.RingGeometry(inset * 0.5 * Math.SQRT2 - 0.03, inset * 0.5 * Math.SQRT2, 4, 1), bevel);
    frame.rotation.z = Math.PI / 4;
    frame.position.z = z;
    frame.scale.setScalar(0.72);
    if (z < 0) frame.rotation.y = Math.PI;
    box.add(frame);
  }

  /* ------------------------- orbiting specks -------------------------- */
  const COUNT = mobile ? 160 : 280;
  const orbit = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.9 + Math.random() * 1.3;
    orbit[i * 3] = Math.cos(a) * r;
    orbit[i * 3 + 1] = (Math.random() - 0.5) * 2.6;
    orbit[i * 3 + 2] = Math.sin(a) * r;
    seeds[i] = Math.random();
  }
  const speckGeo = new THREE.BufferGeometry();
  speckGeo.setAttribute("position", new THREE.BufferAttribute(orbit, 3));
  speckGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const speckMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uDpr: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uDpr;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (1.5 + aSeed * 2.5) * uDpr * (8.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vA = 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 2.0) + aSeed * 50.0), 3.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(1.0, 0.86, 0.92, smoothstep(0.5, 0.0, d) * vA);
      }
    `,
  });
  const specks = new THREE.Points(speckGeo, speckMat);
  root.add(specks);

  /* ------------------------- contact shadow --------------------------- */
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 256;
  const ctx = shadowCanvas.getContext("2d");
  let shadow: import("three").Mesh | undefined;
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(0,0,0,0.6)");
    g.addColorStop(0.6, "rgba(0,0,0,0.15)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 1.1),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.95;
    root.add(shadow);
    stage.onDispose(() => shadowTex.dispose());
  }

  stage.onDispose(() => {
    texture.dispose();
    envRT.dispose();
    pmrem.dispose();
  });

  /* ------------------------------ motion ------------------------------ */
  let yaw = 0;
  stage.onFrame((t, dt) => {
    const p = opts.progress ? opts.progress() : 0;
    // A smooth turn that never stops but eases as each face comes round:
    // speed = 0.42 − 0.26·cos(2θ) is always positive, slowest (0.16) when a
    // face points at the camera and fastest side-on, so the logo and the
    // mirror each linger and the thin edges sweep past.
    yaw += dt * (0.42 - 0.26 * Math.cos(2 * yaw));
    box.rotation.y = yaw + p * Math.PI + pointer.x * 0.35;
    box.rotation.x = Math.sin(t * 0.5) * 0.08 - pointer.y * 0.22;
    box.rotation.z = Math.sin(t * 0.35) * 0.04;
    box.position.y = Math.sin(t * 0.8) * 0.07 + 0.15;

    if (shadow) {
      const s = 1 - (box.position.y - 0.15) * 0.8;
      shadow.scale.set(s, s, 1);
    }

    specks.rotation.y = t * 0.08;
    speckMat.uniforms.uTime.value = t;
  });
}
