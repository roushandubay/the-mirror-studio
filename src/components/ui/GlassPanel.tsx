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
 * Liquid glass, modelled on the macOS Tahoe Control Center controls.
 *
 * What makes those read as glass rather than frosted plastic, in layers:
 *
 *   1. A LIGHT backdrop blur with a strong saturation and brightness lift. The
 *      background keeps its own colour — a red desktop makes red glass — which
 *      is the opposite of the old grey frost.
 *   2. Continuous curvature: capsules and circles by default (`radius` 999).
 *   3. A specular rim. A 1px ring whose brightness follows the light: strong at
 *      the top-left, fading along the sides, catching again at the bottom-right
 *      where light exits the lens. Drawn as a masked gradient border.
 *   4. Lensing at the edge — a soft inner glow and a darker inner edge at the
 *      bottom, so the pane appears thicker at its rim than its centre.
 *   5. A pointer-tracked highlight that slides across the surface.
 *   6. A water-drop ripple on press, from the exact contact point.
 *
 * Tones: `light` for dark/photographic grounds, `dark` for cream grounds,
 * `accent` for the one primary action in a group (a brand-tinted pane, like
 * Control Center's active toggles).
 */
export default function GlassPanel({
  children,
  as = "div",
  tone = "light",
  radius = 999,
  className,
  style,
  sheen = true,
  interactive = true,
  ripple = true,
}: {
  children?: ReactNode;
  as?: ElementType;
  tone?: "light" | "dark" | "accent";
  /** px; 999 = capsule / circle */
  radius?: number;
  className?: string;
  style?: CSSProperties;
  sheen?: boolean;
  interactive?: boolean;
  /** water-drop ripple on press */
  ripple?: boolean;
  /** kept for API compatibility; the rim is now static like the system glass */
  liquid?: boolean;
}) {
  const reduced = useReducedMotion();
  // A plain element, not motion.create(as): creating a motion component inside
  // render mints a new component type each time, so React remounted the whole
  // panel on every state change (each ripple) and restarted its animations.
  const Tag = as;
  const nextId = useRef(0);
  const [drops, setDrops] = useState<{ id: number; x: number; y: number }[]>([]);

  const px = useMotionValue(30);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 170, damping: 24, mass: 0.3 });
  const sy = useSpring(py, { stiffness: 170, damping: 24, mass: 0.3 });
  const highlight = useMotionTemplate`radial-gradient(120% 140% at ${sx}% ${sy}%, rgba(255,255,255,0.32), rgba(255,255,255,0) 55%)`;

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

  const t = TONES[tone];

  return (
    <Tag
      // `group` too: RollLabels inside panels roll on the panel's own hover
      className={cn("group group/glass relative isolate overflow-hidden", t.text, className)}
      style={{
        borderRadius: radius,
        backdropFilter: t.backdrop,
        WebkitBackdropFilter: t.backdrop,
        background: t.fill,
        boxShadow: t.shadow,
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
              px.set(30);
              py.set(0);
            }
          : undefined
      }
    >
      {/* specular rim — a 1px gradient ring, bright where the light enters
          (top-left) and exits (bottom-right) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          borderRadius: "inherit",
          padding: 1,
          background: t.rim,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
        }}
      />

      {/* pointer-tracked highlight gliding across the pane */}
      {sheen && !reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover/glass:opacity-100"
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
              background:
                "radial-gradient(circle, rgba(255,255,255,0.7), rgba(255,255,255,0.18) 55%, rgba(255,255,255,0) 70%)",
            }}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 26, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </AnimatePresence>

      <span className="relative z-20 flex h-full w-full items-center justify-center">{children}</span>
    </Tag>
  );
}

const TONES = {
  /* over dark or photographic grounds */
  light: {
    text: "text-white",
    backdrop: "blur(14px) saturate(190%) brightness(1.12)",
    fill: "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0.1) 100%)",
    rim: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.22) 28%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.18) 74%, rgba(255,255,255,0.6) 100%)",
    shadow:
      "inset 0 1px 1px rgba(255,255,255,0.28), inset 0 -1px 2px rgba(0,0,0,0.18), inset 0 0 14px rgba(255,255,255,0.08), 0 10px 30px -12px rgba(0,0,0,0.45)",
  },
  /* over cream: the pane lifts off the page, so it needs a shadow and a
     slightly darker rim on the lower edge to read at all */
  dark: {
    text: "text-primary-900",
    backdrop: "blur(14px) saturate(180%) brightness(1.04)",
    fill: "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.46) 60%, rgba(255,255,255,0.58) 100%)",
    rim: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 30%, rgba(20,1,10,0.08) 52%, rgba(255,255,255,0.4) 76%, rgba(255,255,255,0.95) 100%)",
    shadow:
      "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(20,1,10,0.08), inset 0 0 14px rgba(255,255,255,0.5), 0 1px 2px rgba(20,1,10,0.06), 0 12px 32px -14px rgba(20,1,10,0.28)",
  },
  /* the primary action: brand-tinted glass */
  accent: {
    text: "text-white",
    backdrop: "blur(14px) saturate(200%) brightness(1.08)",
    fill: "linear-gradient(180deg, rgba(196,24,108,0.88) 0%, rgba(161,5,80,0.82) 55%, rgba(121,4,60,0.9) 100%)",
    rim: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.28) 28%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.2) 74%, rgba(255,255,255,0.65) 100%)",
    shadow:
      "inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(40,1,20,0.3), inset 0 0 16px rgba(255,180,215,0.18), 0 12px 30px -12px rgba(161,5,80,0.6)",
  },
} as const;
