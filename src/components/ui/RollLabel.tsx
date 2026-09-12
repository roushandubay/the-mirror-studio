"use client";

import { cn } from "@/lib/cn";

/**
 * Button label that rolls on hover: the resting label slides up and out while a
 * second copy rises into its place from below, carrying a small diamond marker.
 *
 * Timings are taken from the reference implementation, which transitions the
 * two halves at DIFFERENT speeds — outgoing 0.8s, incoming 1s, both on
 * cubic-bezier(0.22, 1, 0.36, 1). That mismatch is the whole trick: matched
 * durations read as a mechanical flip, while the trailing incoming half reads
 * as weight.
 *
 * Driven purely by `group-hover`, so it costs no JS. Both copies sit in the same
 * grid cell, so the button never changes width mid-roll.
 */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function RollLabel({
  children,
  marker = "◆",
  className,
}: {
  children: React.ReactNode;
  /** set to null to roll to an identical label with no marker */
  marker?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid overflow-hidden [&>*]:col-start-1 [&>*]:row-start-1",
        className,
      )}
    >
      <span
        className="block will-change-transform group-hover:-translate-y-[130%] motion-reduce:transform-none motion-reduce:transition-none"
        style={{ transition: `transform 0.8s ${EASE}` }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="block translate-y-[130%] will-change-transform group-hover:translate-y-0 motion-reduce:hidden"
        style={{ transition: `transform 1s ${EASE}` }}
      >
        {marker && <span className="mr-1.5 align-[0.12em] text-[0.7em]">{marker}</span>}
        {children}
      </span>
    </span>
  );
}
