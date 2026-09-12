"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import DisplayLine from "@/components/ui/DisplayLine";
import MediaFill from "@/components/ui/MediaFill";
import { blockStyle } from "@/lib/blocks/style";
import { useIsMobile } from "@/lib/useViewport";
import type { BandBlock as Data } from "@/lib/blocks/types";

/**
 * Thin full-bleed image band used as punctuation between the long sections.
 * The photo drifts slowly against the scroll so the band never sits dead.
 */
export default function BandBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const drift = block.parallax ?? 90;
  const y = useTransform(scrollYProgress, [0, 1], [-drift / 2, drift / 2]);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ height: block.height ?? 290, ...blockStyle(block.style) }}
    >
      <motion.div
        className="absolute inset-x-0 -top-[10%] h-[120%]"
        style={reduced ? undefined : { y }}
      >
        <MediaFill
          media={block.image}
          src={isMobile && block.image.srcMobile ? block.image.srcMobile : block.image.src}
          fit={isMobile ? block.image.fitMobile ?? "cover" : block.image.fit ?? "cover"}
          sizes="100vw"
        />
      </motion.div>

      <div
        aria-hidden
        className="absolute inset-0 bg-primary-900"
        style={{ opacity: block.overlay ?? 0.35 }}
      />

      {block.caption && (
        <div className="relative z-10 flex h-full items-end px-6 pb-8 lg:px-16">
          <DisplayLine
            text={block.caption}
            align="left"
            className="text-d4 font-light leading-[1.05] text-white"
          />
        </div>
      )}
    </section>
  );
}
