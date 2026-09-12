"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import DisplayLine from "@/components/ui/DisplayLine";
import GlassPanel from "@/components/ui/GlassPanel";
import { blockStyle } from "@/lib/blocks/style";
import type { ClosingCtaBlock as Data } from "@/lib/blocks/types";

/** Final invitation before the footer. */
export default function ClosingCtaBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();

  return (
    <section
      className="w-full bg-primary-750 px-6 py-28 text-white lg:py-36"
      style={blockStyle(block.style)}
    >
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-6 text-center">
        <DisplayLine
          text={block.heading}
          className="text-d3 font-light leading-[1.05] text-white"
        />
        {block.body && <p className="max-w-[48ch] text-body-md text-white/75">{block.body}</p>}

        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={block.cta.href}>
            <motion.div whileHover={reduced ? undefined : { y: -3 }}>
              <GlassPanel className="h-14 px-10 text-white">
                <span className="text-body-sm uppercase tracking-[0.16em]">
                  {block.cta.label}
                </span>
              </GlassPanel>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
