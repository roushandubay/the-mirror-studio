"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import GlassPanel from "@/components/ui/GlassPanel";
import RollLabel from "@/components/ui/RollLabel";
import { cn } from "@/lib/cn";
import type { LinkRef } from "@/lib/blocks/types";

/**
 * The Figma "Button" component (commerce blocks), restyled as liquid glass to
 * match the rest of the site. Variants map onto glass tones:
 *
 *   solid   → brand-tinted glass (the primary action)
 *   outline → clear glass lit for dark grounds
 *   ghost   → clear glass lit for pale grounds
 *   link    → plain underlined text link
 */
const TONE = { solid: "accent", outline: "light", ghost: "dark" } as const;

export default function Button({
  link,
  className,
  fullWidth,
}: {
  link: LinkRef;
  className?: string;
  fullWidth?: boolean;
}) {
  const reduced = useReducedMotion();
  const variant = link.variant ?? "outline";

  if (variant === "link") {
    return (
      <Link href={link.href} className={cn("text-body-md text-primary underline underline-offset-4", className)}>
        {link.label}
      </Link>
    );
  }

  return (
    <Link href={link.href} className={cn("group inline-flex", fullWidth && "w-full", className)}>
      <motion.span className={cn("block", fullWidth && "w-full")} whileHover={reduced ? undefined : { y: -2 }}>
        <GlassPanel tone={TONE[variant]} className={cn("h-12 px-6", fullWidth && "w-full")}>
          <RollLabel marker={null}>
            <span className="whitespace-nowrap text-body-md capitalize">{link.label}</span>
          </RollLabel>
        </GlassPanel>
      </motion.span>
    </Link>
  );
}
