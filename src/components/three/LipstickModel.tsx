"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, type MotionValue } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * The studio's lipstick, rendered in real 3D with a mirror-polished finish.
 *
 * The reflections are real: a generated room environment is convolved into a
 * PMREM cubemap and used as the environment map, so the metal body actually
 * mirrors its surroundings instead of faking it with a gradient. That is the
 * same principle behind Apple's product renders.
 *
 * Scroll drives rotation and dolly. Everything is imported dynamically so
 * Three.js never reaches the server bundle, and the whole scene is skipped for
 * visitors who ask for reduced motion (they get the poster instead).
 */
export default function LipstickModel({
  progress,
  className,
  accent = "#a10550",
  onReady,
}: {
  /** 0..1 scroll position driving rotation and dolly */
  progress?: MotionValue<number>;
  className?: string;
  accent?: string;
  onReady?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import("three");
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
        const { RoomEnvironment } = await import(
          "three/examples/jsm/environments/RoomEnvironment.js"
        );
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(host.clientWidth, host.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // Lifted: the model is viewed through a dark frosted panel, so it has
        // to be rendered brighter than it would be in the open.
        renderer.toneMappingExposure = 1.55;
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          35,
          host.clientWidth / host.clientHeight,
          0.1,
          100,
        );
        camera.position.set(0, 0, 6);

        // Real reflections: a procedural room baked into a prefiltered cubemap
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = envRT.texture;

        // Most of the light comes from the environment map; the lamps only
        // shape it. Hard direct light is what makes CG metal look like plastic.
        const key = new THREE.DirectionalLight(0xfff4ec, 1.35);
        key.position.set(3, 4, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xffd9ea, 0.9);
        rim.position.set(-4, 1, -3);
        scene.add(rim);
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        const root = new THREE.Group();
        scene.add(root);

        // Brushed anodised aluminium: still metal, but rough enough to scatter.
        // Roughness near zero is what reads as "CG chrome" rather than a real case.
        const polished = new THREE.MeshPhysicalMaterial({
          color: 0xd8d2cc,
          metalness: 1,
          roughness: 0.24,
          clearcoat: 0.45,
          clearcoatRoughness: 0.25,
          envMapIntensity: 1.25,
        });
        // Lipstick is waxy — diffuse with a soft sheen, never a glossy shell
        const bullet = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(accent),
          metalness: 0.02,
          roughness: 0.42,
          clearcoat: 0.3,
          clearcoatRoughness: 0.35,
          sheen: 0.7,
          sheenRoughness: 0.5,
          sheenColor: new THREE.Color(accent).offsetHSL(0, -0.15, 0.12),
          envMapIntensity: 0.85,
        });

        const model = await new FBXLoader().loadAsync("/models/lipstick.fbx");
        if (disposed) return;

        // Normalise: centre on the origin and scale the longest axis to ~3 units
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        const longest = Math.max(size.x, size.y, size.z) || 1;
        model.scale.multiplyScalar(3 / longest);
        model.position.sub(centre.multiplyScalar(3 / longest));

        // The topmost mesh is the exposed bullet; everything else is the case
        const meshes: import("three").Mesh[] = [];
        model.traverse((child) => {
          const m = child as import("three").Mesh;
          if (m.isMesh) meshes.push(m);
        });
        meshes.sort((a, b) => {
          const ay = new THREE.Box3().setFromObject(a).max.y;
          const by = new THREE.Box3().setFromObject(b).max.y;
          return by - ay;
        });
        meshes.forEach((m, i) => {
          m.material = i === 0 && meshes.length > 1 ? bullet : polished;
        });

        root.add(model);

        // Soft contact shadow. A floating object with no ground contact is the
        // other half of why CG renders look fake.
        const shadowCanvas = document.createElement("canvas");
        shadowCanvas.width = shadowCanvas.height = 256;
        const ctx = shadowCanvas.getContext("2d");
        if (ctx) {
          const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
          g.addColorStop(0, "rgba(0,0,0,0.55)");
          g.addColorStop(0.55, "rgba(0,0,0,0.18)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 256, 256);
          const shadowTex = new THREE.CanvasTexture(shadowCanvas);
          const shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(4.2, 4.2),
            new THREE.MeshBasicMaterial({
              map: shadowTex,
              transparent: true,
              depthWrite: false,
            }),
          );
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.y = -1.65;
          root.add(shadow);
        }

        onReady?.();

        const onResize = () => {
          if (!host.clientWidth || !host.clientHeight) return;
          camera.aspect = host.clientWidth / host.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(host.clientWidth, host.clientHeight);
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(host);

        let p = progress?.get() ?? 0;
        const unsub = progress?.on("change", (v) => {
          p = v;
        });

        let raf = 0;
        const clock = new THREE.Clock();
        const tick = () => {
          const t = clock.getElapsedTime();
          // One full turn across the (now much shorter) scrub, plus the faintest
          // idle drift so the specular stays alive when the page is still
          root.rotation.y = p * Math.PI * 2 + t * 0.06;
          root.rotation.x = Math.sin(t * 0.3) * 0.03 - p * 0.18;
          root.position.y = Math.sin(t * 0.5) * 0.035;
          camera.position.z = 6 - p * 1.2;
          renderer.render(scene, camera);
          raf = requestAnimationFrame(tick);
        };
        tick();

        cleanup = () => {
          cancelAnimationFrame(raf);
          unsub?.();
          ro.disconnect();
          envRT.dispose();
          pmrem.dispose();
          polished.dispose();
          bullet.dispose();
          meshes.forEach((m) => m.geometry.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (err) {
        console.error("[LipstickModel] failed to initialise", err);
        setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reduced, accent, progress, onReady]);

  if (reduced || failed) return null;

  return <div ref={hostRef} className={cn("h-full w-full", className)} aria-hidden />;
}
