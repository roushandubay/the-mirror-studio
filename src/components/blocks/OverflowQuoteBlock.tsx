"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { blockStyle } from "@/lib/blocks/style";
import type { OverflowQuoteBlock as Data } from "@/lib/blocks/types";

/**
 * The closing statement, set enormous and deliberately running past both
 * viewport edges, with a slowly rotating seal at its centre. Alternate lines
 * drift in opposite directions on scroll so the wall of type stays alive.
 */
export default function OverflowQuoteBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const driftL = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const driftR = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-canvas py-28 lg:py-40"
      style={blockStyle(block.style)}
    >
      <div className="relative">
        {block.lines.map((line, i) => (
          <motion.p
            key={i}
            className="liquid-text liquid-text-dark edge-bleed text-center font-display text-d1 font-light uppercase leading-[1.02] text-primary-900"
            style={reduced ? undefined : { x: i % 2 === 0 ? driftL : driftR }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.p>
        ))}

        {/* rotating seal, centred over the type */}
        {(block.seal || block.sealText) && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              className="flex h-[120px] w-[120px] items-center justify-center rounded-full lg:h-[170px] lg:w-[170px]"
              style={{
                background:
                  "radial-gradient(circle at 32% 28%, #fff 0%, #e6dcd4 32%, #a89a90 62%, #5d5148 100%)",
                boxShadow:
                  "inset 0 2px 6px rgba(255,255,255,0.85), inset 0 -6px 14px rgba(0,0,0,0.35), 0 16px 40px -16px rgba(20,1,10,0.55)",
              }}
              animate={reduced ? undefined : { rotate: 360 }}
              transition={{ duration: 44, ease: "linear", repeat: Infinity }}
            >
              {block.seal ? (
                <Image
                  src={block.seal.src}
                  alt=""
                  width={170}
                  height={170}
                  className="h-[78%] w-[78%] rounded-full object-cover mix-blend-luminosity opacity-90"
                />
              ) : (
                <span className="font-display text-[15px] uppercase tracking-[0.3em] text-primary-900/80">
                  {block.sealText}
                </span>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {block.attribution && (
        <p className="mt-12 text-center text-overline uppercase tracking-[0.24em] text-muted">
          {block.attribution}
        </p>
      )}
    </section>
  );
}
