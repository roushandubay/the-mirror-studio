"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import GlassPanel from "@/components/ui/GlassPanel";
import Magnetic from "@/components/motion/Magnetic";
import RollLabel from "@/components/ui/RollLabel";
import { cn } from "@/lib/cn";
import type { LinkRef } from "@/lib/blocks/types";

/**
 * The site's call-to-action: a liquid-glass pill with a rolling label that
 * leans toward the cursor. `tone="light"` for dark grounds, `"dark"` for cream.
 *
 * Every CTA on the inner pages is this one component, so the whole site's
 * buttons can be retuned in one place.
 */
export default function GlassCta({
  link,
  tone = "light",
  size = "md",
  className,
}: {
  link: LinkRef;
  tone?: "light" | "dark" | "accent";
  size?: "md" | "lg";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const external = /^https?:/.test(link.href);
  const inner = (
    <motion.span className="block" whileHover={reduced ? undefined : { y: -2 }}>
      <GlassPanel
        tone={tone}
        className={cn(
          "whitespace-nowrap",
          size === "lg" ? "h-16 px-10" : "h-14 px-8",
        )}
      >
        <RollLabel>
          <span className="text-body-sm uppercase tracking-[0.16em]">{link.label}</span>
        </RollLabel>
      </GlassPanel>
    </motion.span>
  );

  return (
    <Magnetic strength={0.2} className={className}>
      {external ? (
        <a href={link.href} target="_blank" rel="noreferrer noopener" className="group block">
          {inner}
        </a>
      ) : (
        <Link href={link.href} className="group block">
          {inner}
        </Link>
      )}
    </Magnetic>
  );
}

/**
 * The secondary action beside a GlassCta — the same liquid glass, but a
 * lighter, clearer pane (no magnetic pull), so the pair reads as primary +
 * secondary like a system dialog.
 */
export function TextCta({
  link,
  tone = "light",
  className,
}: {
  link: LinkRef;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Link href={link.href} className={cn("group inline-flex", className)}>
      <GlassPanel
        tone={tone}
        className="h-14 whitespace-nowrap px-7"
        style={tone === "light" ? { background: "rgba(255,255,255,0.04)" } : undefined}
      >
        <RollLabel marker={null}>
          <span className="text-body-sm uppercase tracking-[0.16em]">{link.label}</span>
        </RollLabel>
      </GlassPanel>
    </Link>
  );
}
