"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * Scrubs its child vertically against page scroll. `distance` is the total
 * travel in px across the element's full pass through the viewport.
 */
export default function Parallax({
  children,
  distance = 80,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance / 2, -distance / 2]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, height: "100%", willChange: "transform" }}>{children}</motion.div>
    </div>
  );
}
