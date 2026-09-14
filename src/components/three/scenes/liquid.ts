import type { Stage } from "@/lib/three/stage";
import type { SceneOptions } from "./types";

/**
 * Liquid chrome — a pool of molten, pearl-and-rose metal that swells under the
 * pointer.
 *
 * One full-screen triangle and one fragment shader, so it costs a single draw
 * call. The surface is a domain-warped noise height field; its gradient gives a
 * normal, and that normal reflects a procedural studio (two softboxes and a
 * warm key) — which is why it reads as polished metal rather than a gradient.
 * A thin-film term tints the grazing angles like the inside of a shell.
 *
 * Rendered at a capped pixel ratio: the surface is soft by nature, so the extra
 * resolution would be invisible and expensive.
 */
export function mountLiquid(stage: Stage, opts: SceneOptions) {
  const { THREE, scene, camera, host, pointer } = stage;

  const accent = new THREE.Color(opts.accent ?? "#a10550");

  const mat = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(host.clientWidth, host.clientHeight) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uProgress: { value: 0 },
      uAccent: { value: accent },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uTime;
      uniform vec2 uRes;
      uniform vec2 uPointer;
      uniform float uProgress;
      uniform vec3 uAccent;
      varying vec2 vUv;

      vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                   mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = mat2(1.6, 1.2, -1.2, 1.6) * p;
          a *= 0.5;
        }
        return v;
      }

      float height(vec2 p) {
        float t = uTime * 0.07;
        vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t)));
        vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t));
        float h = fbm(p + 2.6 * r);
        // a swell rising under the pointer
        vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
        vec2 m = (uPointer * 0.5 + 0.5) * aspect;
        float d = length(p / 1.6 - m);
        h += 0.28 * exp(-d * d * 7.0) * (0.8 + 0.2 * sin(d * 18.0 - uTime * 2.4));
        return h;
      }

      // Procedural studio reflected in the metal: two softboxes and a warm key
      vec3 studio(vec3 r) {
        vec3 col = mix(vec3(0.03, 0.0, 0.015), vec3(0.16, 0.05, 0.09), smoothstep(-1.0, 1.0, r.y));
        col += vec3(1.0, 0.94, 0.96) * smoothstep(0.82, 0.98, 1.0 - abs(r.x - 0.35)) * smoothstep(0.1, 0.6, r.y) * 1.3;
        col += vec3(1.0, 0.86, 0.92) * smoothstep(0.9, 0.99, 1.0 - abs(r.x + 0.55)) * smoothstep(-0.2, 0.4, r.y) * 0.8;
        col += vec3(0.85, 0.66, 0.42) * pow(max(dot(r, normalize(vec3(0.4, 0.7, 0.6))), 0.0), 18.0) * 1.4;
        return col;
      }

      void main() {
        vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
        vec2 p = vUv * aspect * 1.6;

        float e = 0.004;
        float h = height(p);
        float hx = height(p + vec2(e, 0.0)) - h;
        float hy = height(p + vec2(0.0, e)) - h;
        vec3 n = normalize(vec3(-hx / e * 0.09, -hy / e * 0.09, 1.0));

        vec3 v = vec3(0.0, 0.0, -1.0);
        vec3 r = reflect(v, n);
        vec3 col = studio(r);

        // thin-film iridescence at grazing angles, pulled toward the brand colour
        float fres = pow(1.0 - n.z, 2.2);
        vec3 film = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + fres * 2.4 + h * 1.5));
        col = mix(col, film * mix(vec3(1.0), uAccent * 2.2, 0.55), clamp(fres * 1.6, 0.0, 0.75));

        // body colour of the metal: deep plum in the troughs, rose on the crests
        col *= mix(vec3(0.55, 0.28, 0.4), vec3(1.1, 0.95, 1.0), smoothstep(-0.3, 0.5, h));

        // vignette so content laid over it stays legible
        float vig = smoothstep(1.25, 0.25, length(vUv - 0.5) * 1.6);
        col *= mix(0.35, 1.0, vig);
        col = mix(col, col * vec3(0.5, 0.3, 0.4), uProgress * 0.6);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  // A single oversized triangle covers the screen with no diagonal seam
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);
  camera.position.set(0, 0, 1);

  stage.onFrame((t) => {
    mat.uniforms.uTime.value = t;
    mat.uniforms.uRes.value.set(host.clientWidth || 1, host.clientHeight || 1);
    mat.uniforms.uPointer.value.set(pointer.x, pointer.y);
    mat.uniforms.uProgress.value = opts.progress ? opts.progress() : 0;
  });
}
