"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { blockStyle } from "@/lib/blocks/style";
import type { PullQuoteBlock as Data } from "@/lib/blocks/types";

/**
 * Founder quote set large in the display italic, with her portrait alongside.
 * The quote reveals line by line as it scrolls up.
 */
export default function PullQuoteBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  const lines = block.quote.split("\n");

  return (
    <section
      ref={ref}
      className="w-full bg-canvas px-6 py-28 lg:py-40"
      style={blockStyle(block.style)}
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[380px_1fr]">
        {block.image && (
          <Reveal anim={{ on: "mask-wipe", duration: 1.1 }}>
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <motion.div className="absolute -inset-y-8 inset-x-0" style={reduced ? undefined : { y }}>
                <Image
                  src={block.image.src}
                  alt={block.image.alt ?? block.attribution ?? ""}
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 90vw, 380px"
                  className="object-cover"
                  style={{ objectPosition: block.image.focal ?? "50% 35%" }}
                />
              </motion.div>
            </div>
          </Reveal>
        )}

        <div>
          {/* The trigger must live on the UNCLIPPED parent. A motion element
              that starts translated out of an overflow-hidden wrapper is fully
              clipped, and IntersectionObserver clips against ancestors — so a
              whileInView on the inner span would never fire at all. */}
          <motion.blockquote
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: reduced ? 0 : 0.09 } },
            }}
          >
            {lines.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  className="block font-display text-d4 font-light italic leading-[1.22] text-primary-900"
                  variants={{
                    hidden: { y: "108%" },
                    show: { y: "0%", transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.blockquote>

          {(block.attribution || block.role) && (
            <motion.figcaption
              className="mt-8 flex flex-col gap-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              {block.attribution && (
                <span className="text-overline uppercase tracking-[0.22em] text-primary">
                  {block.attribution}
                </span>
              )}
              {block.role && (
                <span className="text-overline uppercase tracking-[0.22em] text-muted">
                  {block.role}
                </span>
              )}
            </motion.figcaption>
          )}
        </div>
      </div>
    </section>
  );
}
