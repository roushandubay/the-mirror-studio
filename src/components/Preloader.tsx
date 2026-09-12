"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import DisplayLine from "@/components/ui/DisplayLine";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Opening curtain with a live percentage, matching the reference site's
 * entrance. The counter tracks real progress — how many of the document's
 * images have decoded — rather than running a fake timer, and it always
 * resolves so a slow asset can never trap the visitor behind it.
 */
export default function Preloader({
  line = "where every _reflection_ BECOMES ART.",
  minMs = 900,
  maxMs = 4000,
}: {
  line?: string;
  minMs?: number;
  maxMs?: number;
}) {
  const reduced = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) {
      setDone(true);
      return;
    }

    const started = performance.now();
    let raf = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setPct(100);
      const elapsed = performance.now() - started;
      setTimeout(() => setDone(true), Math.max(0, minMs - elapsed) + 260);
    };

    const tick = () => {
      const imgs = Array.from(document.images);
      const loaded = imgs.filter((i) => i.complete).length;
      const ratio = imgs.length ? loaded / imgs.length : 1;
      const elapsed = (performance.now() - started) / maxMs;
      // Take whichever is further along, so the bar always advances
      setPct(Math.min(99, Math.round(Math.max(ratio, elapsed) * 100)));
      if (ratio >= 1 && performance.now() - started >= minMs) return finish();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Hard ceiling — never hold the page hostage
    const bail = setTimeout(finish, maxMs);
    window.addEventListener("load", finish);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(bail);
      window.removeEventListener("load", finish);
    };
  }, [reduced, minMs, maxMs]);

  // Keep the page from scrolling underneath the curtain
  useEffect(() => {
    if (done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-canvas px-6"
          exit={{ y: "-100%" }}
          transition={{ duration: 1.05, ease: EASE }}
          aria-hidden
        >
          <DisplayLine
            text={line}
            inView={false}
            delay={0.15}
            stagger={0.05}
            className="max-w-[16ch] text-d3 font-light leading-[1.04] text-primary-900"
          />

          <div className="absolute inset-x-6 bottom-8 flex items-center gap-4 lg:inset-x-10">
            <div className="h-px flex-1 bg-primary-900/20">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
            </div>
            <span className="w-14 text-right font-display text-[18px] tabular-nums text-primary-900/70">
              {pct}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
