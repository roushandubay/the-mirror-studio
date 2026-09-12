"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/** Hairline reading-progress bar pinned to the top of the viewport. */
export default function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left bg-primary"
      style={{ scaleX }}
    />
  );
}
