import type { Stage } from "@/lib/three/stage";
import type { SceneOptions } from "./types";

/**
 * "Pan India & abroad", as a place rather than a sentence.
 *
 * A dotted globe with light arcs flying out of Siliguri to every city the
 * studio travels to. Built entirely procedurally — no textures, no model file:
 *
 *  - ~4k dots on a Fibonacci sphere (the only even distribution that has no
 *    visible poles), shaded in the vertex stage so dots on the far side fade to
 *    a whisper instead of being hidden — you see the globe has depth.
 *  - each arc is a thin tube along a great-circle path lifted by its length, so
 *    long-haul flights to London arch higher than the hop to Kolkata. A comet of
 *    light travels each one on its own phase.
 *  - a Fresnel rim on a back-faced shell gives the atmosphere.
 *
 * Scroll turns the globe from India toward the Gulf and Europe; the pointer
 * tilts it.
 */

const R = 1.6;

type City = { name: string; lat: number; lon: number };

const ORIGIN: City = { name: "Siliguri", lat: 26.73, lon: 88.4 };

export const GLOBE_CITIES: City[] = [
  { name: "Delhi", lat: 28.61, lon: 77.21 },
  { name: "Mumbai", lat: 19.08, lon: 72.88 },
  { name: "Kolkata", lat: 22.57, lon: 88.36 },
  { name: "Jaipur", lat: 26.91, lon: 75.79 },
  { name: "Udaipur", lat: 24.59, lon: 73.71 },
  { name: "Goa", lat: 15.3, lon: 74.12 },
  { name: "Bengaluru", lat: 12.97, lon: 77.59 },
  { name: "Guwahati", lat: 26.14, lon: 91.74 },
  { name: "Gangtok", lat: 27.33, lon: 88.61 },
  { name: "Kathmandu", lat: 27.72, lon: 85.32 },
  { name: "Dubai", lat: 25.2, lon: 55.27 },
  { name: "London", lat: 51.51, lon: -0.13 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "Bangkok", lat: 13.76, lon: 100.5 },
  { name: "Bali", lat: -8.34, lon: 115.09 },
  { name: "Toronto", lat: 43.65, lon: -79.38 },
];

export function mountGlobe(stage: Stage, opts: SceneOptions) {
  const { THREE, scene, camera, pointer } = stage;
  const accent = new THREE.Color(opts.accent ?? "#fa58a6");
  const mobile = window.innerWidth < 1024;

  camera.position.set(0, 0, mobile ? 8.2 : 7.2);

  const toVec = (lat: number, lon: number, r = R) => {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  };

  const globe = new THREE.Group();
  scene.add(globe);

  /* ------------------------------- dots -------------------------------- */
  const COUNT = mobile ? 2600 : 4200;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    pos[i * 3] = Math.cos(th) * rad * R;
    pos[i * 3 + 1] = y * R;
    pos[i * 3 + 2] = Math.sin(th) * rad * R;
    seed[i] = Math.random();
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  dotGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

  const dotMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#fdd9e8") },
      uDpr: { value: stage.renderer.getPixelRatio() },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uDpr;
      varying float vFacing;
      varying float vTwinkle;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normalize(position));
        vFacing = n.z;
        vTwinkle = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 40.0);
        gl_PointSize = (2.4 + aSeed * 1.8) * uDpr * (7.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vFacing;
      varying float vTwinkle;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);
        // far side of the globe fades to a whisper rather than disappearing
        float front = smoothstep(-0.25, 0.55, vFacing);
        float a = soft * mix(0.07, 0.85, front) * vTwinkle;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });
  globe.add(new THREE.Points(dotGeo, dotMat));

  /* ---------------------------- atmosphere ----------------------------- */
  const atmoMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: accent } },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      void main() {
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec3 vN;
      void main() {
        // Back faces of the shell: the view-space normal points AWAY from the
        // camera, so -z runs 1 at the centre of the disc to 0 at the outer
        // silhouette. The halo must be zero at both ends — nothing over the
        // face of the globe (the additive dots do not hide it), nothing at the
        // outer edge — and peak just outside the planet's limb.
        float d = -vN.z;
        float glow = smoothstep(0.0, 0.5, d) * (1.0 - smoothstep(0.5, 0.6, d));
        gl_FragColor = vec4(uColor, glow * glow * 0.32);
      }
    `,
  });
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.18, 64, 64), atmoMat);
  scene.add(atmo);

  // a faint equator and tropic of cancer ring — orientation cues, very quiet
  const ringMat = new THREE.LineBasicMaterial({ color: "#fdabd2", transparent: true, opacity: 0.12 });
  for (const lat of [0, 23.4]) {
    const pts: import("three").Vector3[] = [];
    for (let lon = -180; lon <= 180; lon += 3) pts.push(toVec(lat, lon, R * 1.002));
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
  }

  /* ------------------------------- arcs -------------------------------- */
  const from = toVec(ORIGIN.lat, ORIGIN.lon);
  const arcMats: import("three").ShaderMaterial[] = [];

  GLOBE_CITIES.forEach((city, i) => {
    const to = toVec(city.lat, city.lon);
    const dist = from.distanceTo(to);
    // great-circle points, lifted into an arch proportional to distance
    const pts: import("three").Vector3[] = [];
    const SEG = 64;
    for (let s = 0; s <= SEG; s++) {
      const t = s / SEG;
      const p = new THREE.Vector3().copy(from).lerp(to, t).normalize();
      const lift = 1 + Math.sin(Math.PI * t) * (0.04 + dist * 0.18);
      pts.push(p.multiplyScalar(R * lift));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.TubeGeometry(curve, 96, mobile ? 0.006 : 0.0045, 6, false);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: (i * 0.137) % 1 },
        uSpeed: { value: 0.16 + (1 / (dist + 0.6)) * 0.08 },
        uColor: { value: accent },
      },
      vertexShader: /* glsl */ `
        varying float vT;
        varying float vFacing;
        void main() {
          vT = uv.x;
          vec3 n = normalize(normalMatrix * normalize(position));
          vFacing = n.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uPhase;
        uniform float uSpeed;
        uniform vec3 uColor;
        varying float vT;
        varying float vFacing;
        void main() {
          float head = fract(uTime * uSpeed + uPhase) * 1.6 - 0.3;
          // bright comet with a long, fading tail
          float tail = smoothstep(head - 0.42, head, vT) * step(vT, head);
          float glow = tail * tail;
          float base = 0.22;
          float front = smoothstep(-0.35, 0.4, vFacing);
          vec3 col = mix(uColor, vec3(1.0), glow * 0.6);
          gl_FragColor = vec4(col, (base + glow) * mix(0.15, 1.0, front));
        }
      `,
    });
    arcMats.push(mat);
    globe.add(new THREE.Mesh(tube, mat));
  });

  /* ------------------------------- pins -------------------------------- */
  const pinGeo = new THREE.SphereGeometry(0.022, 12, 12);
  const pinMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const originMat = new THREE.MeshBasicMaterial({ color: accent });
  const ringGeo = new THREE.RingGeometry(0.03, 0.045, 32);
  const pulses: { mesh: import("three").Mesh; phase: number }[] = [];

  const addPin = (city: City, isOrigin: boolean) => {
    const p = toVec(city.lat, city.lon, R * 1.004);
    const pin = new THREE.Mesh(pinGeo, isOrigin ? originMat : pinMat);
    pin.position.copy(p);
    if (isOrigin) pin.scale.setScalar(1.8);
    globe.add(pin);

    const ringMat = new THREE.MeshBasicMaterial({
      color: isOrigin ? accent : new THREE.Color("#fdabd2"),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(p);
    ring.lookAt(p.clone().multiplyScalar(2));
    globe.add(ring);
    pulses.push({ mesh: ring, phase: Math.random() });
  };
  addPin(ORIGIN, true);
  GLOBE_CITIES.forEach((c) => addPin(c, false));

  /* ------------------------------ motion ------------------------------- */
  // Yaw that brings a longitude to face the camera, pitch that centres a latitude
  const yawFor = (lon: number) => {
    const L = THREE.MathUtils.degToRad(lon);
    return Math.atan2(-Math.cos(L), -Math.sin(L));
  };
  const startYaw = yawFor(84);
  let endYaw = yawFor(36);
  // take the short way round
  while (endYaw - startYaw > Math.PI) endYaw -= Math.PI * 2;
  while (endYaw - startYaw < -Math.PI) endYaw += Math.PI * 2;

  let yaw = startYaw;
  let pitch = THREE.MathUtils.degToRad(20);

  stage.onFrame((t, dt) => {
    const p = opts.progress ? opts.progress() : 0.5 + Math.sin(t * 0.08) * 0.5;
    const targetYaw = THREE.MathUtils.lerp(startYaw, endYaw, p) + pointer.x * 0.35 + Math.sin(t * 0.1) * 0.04;
    const targetPitch = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(20, 30, p)) - pointer.y * 0.18;
    const k = 1 - Math.pow(0.02, dt);
    yaw += (targetYaw - yaw) * k;
    pitch += (targetPitch - pitch) * k;
    globe.rotation.set(pitch, yaw, 0, "XYZ");

    dotMat.uniforms.uTime.value = t;
    for (const m of arcMats) m.uniforms.uTime.value = t;
    for (const { mesh, phase } of pulses) {
      const f = (t * 0.55 + phase) % 1;
      mesh.scale.setScalar(1 + f * 2.6);
      (mesh.material as import("three").MeshBasicMaterial).opacity = (1 - f) * 0.7;
    }
  });
}
