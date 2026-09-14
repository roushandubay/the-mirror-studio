"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

const EASE = [0.83, 0, 0.17, 1] as const;

/**
 * Page transition. A template remounts on every navigation, so this runs once
 * per page: a plum curtain carrying the studio's name covers the new page
 * before it paints, then lifts away in one long, weighted stroke.
 *
 * The very first load is skipped — the homepage has its own preloader, and an
 * inner page opened directly should not make anyone wait.
 *
 * Deliberately a SIBLING of the page, never a transformed wrapper: a transform
 * on an ancestor would become the containing block for the fixed header and
 * every sticky pin inside the page.
 */
let hasNavigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const [curtain, setCurtain] = useState(false);
  // Decide once per mount. React's dev double-invoke of effects would
  // otherwise read `hasNavigated` as already set and cover the first load.
  const decided = useRef<boolean | null>(null);

  // Layout effect: decided before the browser paints, so the new page is never
  // seen uncovered for a frame
  useLayoutEffect(() => {
    if (decided.current === null) {
      decided.current = hasNavigated && !reduced;
      hasNavigated = true;
    }
    if (decided.current) setCurtain(true);
    const t = window.setTimeout(() => setCurtain(false), 60);
    return () => window.clearTimeout(t);
  }, [reduced]);

  return (
    <>
      {children}
      <AnimatePresence>
        {curtain && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center bg-primary-900"
            initial={false}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 1, ease: EASE }}
          >
            <motion.span
              className="font-display text-[clamp(22px,2.4vw,34px)] uppercase tracking-[0.4em] text-white"
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              The Mirror
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
