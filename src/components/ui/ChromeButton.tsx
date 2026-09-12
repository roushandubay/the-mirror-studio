"use client";

import type { ReactNode } from "react";
import RollLabel from "@/components/ui/RollLabel";
import { useIsMobile } from "@/lib/useViewport";
import { cn } from "@/lib/cn";

/**
 * The floating hero chrome, matched to the reference site measurement for
 * measurement.
 *
 * DESKTOP — a plain text button: 45px tall with 10px padding, fully
 * transparent (no background, no backdrop-filter, no border, no shadow, no
 * radius), 15px display serif at 0.9px letter-spacing in #f8f8f8, and a
 * two-speed roll on hover. There is deliberately no glass here: the reference
 * header chain is transparent top to bottom, and a panel behind the label is
 * what made ours look heavy.
 *
 * MOBILE — a bare 45px icon, no panel, with a drop shadow for legibility. The
 * reference switches to an icon at this size too.
 *
 * `useIsMobile` returns null until mounted; treating that as desktop keeps the
 * server and first client render identical.
 */
export default function ChromeButton({
  icon,
  label,
  tone = "light",
  className,
}: {
  icon: ReactNode;
  label: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const isMobile = useIsMobile();
  const colour = tone === "light" ? "text-[#f8f8f8]" : "text-ink";
  const shadow = tone === "light" ? "drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]" : "drop-shadow-none";

  if (isMobile) {
    return (
      <span
        className={cn(
          "flex h-[45px] w-[45px] items-center justify-center",
          "transition-colors duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
          colour,
          shadow,
          className,
        )}
      >
        {icon}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "group flex h-[45px] items-center justify-center p-[10px]",
        colour,
        shadow,
        "transition-colors duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
        className,
      )}
    >
      <RollLabel className="px-[10px] font-display text-[15px] uppercase leading-[15px] tracking-[0.9px]">
        {label}
      </RollLabel>
    </span>
  );
}
