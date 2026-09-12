"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Liquid glass.
 *
 * Five layers, stacked bottom to top:
 *   1. heavy backdrop blur + saturation — the refraction. The saturation boost
 *      is what keeps the colour behind the glass alive instead of grey.
 *   2. a faint fill, brighter at the top, so light appears to fall off downward
 *   3. an edge refraction ring: a bright hairline that is strongest at the top
 *      left and bottom right, which is how a real bevel catches light
 *   4. a pointer-tracked specular highlight — the polish
 *   5. a water-drop ripple on press, expanding from the exact contact point
 *
 * Corners are square by default; the reference design uses sharp rectangles.
 */
export default function GlassPanel({
  children,
  as = "div",
  tone = "light",
  radius = 2,
  className,
  style,
  sheen = true,
  interactive = true,
  ripple = true,
  liquid = true,
}: {
  children?: ReactNode;
  as?: ElementType;
  /** which way the glass is lit — light for dark backdrops, dark for pale ones */
  tone?: "light" | "dark";
  radius?: number;
  className?: string;
  style?: CSSProperties;
  sheen?: boolean;
  interactive?: boolean;
  /** water-drop ripple on press */
  ripple?: boolean;
  /** animated caustics — the "liquid" in liquid glass */
  liquid?: boolean;
}) {
  const reduced = useReducedMotion();
  // A plain element, not motion.create(as): creating a motion component inside
  // render mints a new component type each time, so React remounted the whole
  // panel on every state change (each ripple) and restarted its animations.
  const Tag = as;
  const nextId = useRef(0);
  const [drops, setDrops] = useState<{ id: number; x: number; y: number }[]>([]);

  const px = useMotionValue(50);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 160, damping: 22, mass: 0.3 });
  const sy = useSpring(py, { stiffness: 160, damping: 22, mass: 0.3 });

  const highlight = useMotionTemplate`radial-gradient(140px circle at ${sx}% ${sy}%, rgba(255,255,255,0.42), rgba(255,255,255,0) 72%)`;

  const isLight = tone === "light";

  const drop = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!ripple || reduced) return;
      const r = e.currentTarget.getBoundingClientRect();
      const id = nextId.current++;
      setDrops((d) => [...d, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
      window.setTimeout(() => setDrops((d) => d.filter((p) => p.id !== id)), 900);
    },
    [ripple, reduced],
  );

  return (
    <Tag
      className={cn("group relative isolate overflow-hidden", className)}
      style={{
        borderRadius: radius,
        backdropFilter: "blur(28px) saturate(200%)",
        WebkitBackdropFilter: "blur(28px) saturate(200%)",
        background: isLight
          ? "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))"
          : "linear-gradient(180deg, rgba(255,255,255,0.66), rgba(255,255,255,0.46))",
        boxShadow: isLight
          ? // edge refraction: bright top-left bevel, soft bottom occlusion
            "inset 1px 1px 0 rgba(255,255,255,0.42), inset -1px -1px 0 rgba(255,255,255,0.12), inset 0 0 12px rgba(255,255,255,0.10), 0 8px 28px -14px rgba(0,0,0,0.45)"
          : "inset 1px 1px 0 rgba(255,255,255,0.9), inset -1px -1px 0 rgba(255,255,255,0.5), inset 0 0 12px rgba(255,255,255,0.4), 0 8px 26px -16px rgba(20,1,10,0.35)",
        ...style,
      }}
      onPointerDown={drop}
      onPointerMove={
        interactive && !reduced
          ? (e: React.PointerEvent<HTMLElement>) => {
              const r = e.currentTarget.getBoundingClientRect();
              px.set(((e.clientX - r.left) / r.width) * 100);
              py.set(((e.clientY - r.top) / r.height) * 100);
            }
          : undefined
      }
      onPointerLeave={
        interactive && !reduced
          ? () => {
              px.set(50);
              py.set(0);
            }
          : undefined
      }
    >
      {/* rim caustic: a rotating conic highlight clipped to the 1px border */}
      {liquid && !reduced && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          style={{ borderRadius: "inherit" }}
        >
          <span
            className="absolute left-1/2 top-1/2 aspect-square w-[240%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background: isLight
                ? "conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.55) 40deg, rgba(255,255,255,0) 90deg, rgba(255,255,255,0) 200deg, rgba(255,255,255,0.35) 250deg, rgba(255,255,255,0) 300deg)"
                : "conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.95) 40deg, rgba(255,255,255,0) 90deg, rgba(255,255,255,0) 200deg, rgba(255,255,255,0.7) 250deg, rgba(255,255,255,0) 300deg)",
              animation: "liquid-rim 9s linear infinite",
              // keep the caustic on the rim only
              WebkitMask:
                "radial-gradient(closest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
              mask: "radial-gradient(closest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
            }}
          />
        </span>
      )}

      {/* interior refraction: two drifting blobs, out of phase */}
      {liquid && !reduced && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-70 mix-blend-overlay"
          style={{ borderRadius: "inherit" }}
        >
          <span
            className="absolute inset-[-40%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.5), rgba(255,255,255,0) 62%)",
              animation: "liquid-drift-a 11s ease-in-out infinite",
            }}
          />
          <span
            className="absolute inset-[-40%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.34), rgba(255,255,255,0) 58%)",
              animation: "liquid-drift-b 14s ease-in-out infinite",
            }}
          />
        </span>
      )}

      {sheen && !reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-70 mix-blend-soft-light"
          style={{ borderRadius: "inherit", backgroundImage: highlight }}
        />
      )}

      {/* water-drop ripples */}
      <AnimatePresence>
        {drops.map((d) => (
          <motion.span
            key={d.id}
            aria-hidden
            className="pointer-events-none absolute z-10 rounded-full"
            style={{
              left: d.x,
              top: d.y,
              width: 12,
              height: 12,
              marginLeft: -6,
              marginTop: -6,
              background: isLight
                ? "radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 55%, rgba(255,255,255,0) 70%)"
                : "radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.25) 55%, rgba(255,255,255,0) 70%)",
            }}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 26, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </AnimatePresence>

      <span className="relative z-20 flex h-full w-full items-center justify-center">
        {children}
      </span>
    </Tag>
  );
}
