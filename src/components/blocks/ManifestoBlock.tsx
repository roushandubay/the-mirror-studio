"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import DisplayLine from "@/components/ui/DisplayLine";
import GlassPanel from "@/components/ui/GlassPanel";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { blockStyle, wellStyle } from "@/lib/blocks/style";
import type { ManifestoBlock as Data } from "@/lib/blocks/types";

/**
 * The written centre of the page: a display heading, a lead line, and body
 * paragraphs set narrow and generously leaded, closing on a glass CTA.
 */
export default function ManifestoBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();

  return (
    <section
      className="w-full bg-canvas px-6 py-32 lg:py-48"
      style={blockStyle(block.style)}
    >
      <div className="mx-auto max-w-[1100px]" style={wellStyle(block.style)}>
        <DisplayLine
          text={block.heading}
          className="liquid-text liquid-text-dark text-d2 font-light leading-[1.02] text-primary-900"
        />

        {block.lead && (
          <Reveal anim={{ on: "rise", duration: 0.9 }}>
            <p className="mx-auto mt-12 max-w-[52ch] text-center font-display text-d5 italic leading-[1.5] text-primary-700">
              {block.lead}
            </p>
          </Reveal>
        )}

        {block.body && block.body.length > 0 && (
          <Reveal group anim={{ stagger: 0.12 }} className="mx-auto mt-10 max-w-[62ch]">
            {block.body.map((para, i) => (
              <RevealItem key={i} duration={0.8}>
                <p className="mb-5 text-center text-body-md leading-[1.9] text-ink/80">{para}</p>
              </RevealItem>
            ))}
          </Reveal>
        )}

        {block.cta && (
          <motion.div
            className="mt-14 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={block.cta.href}>
              <motion.div whileHover={reduced ? undefined : { y: -3 }}>
                <GlassPanel tone="dark" className="h-14 px-9 text-primary-900">
                  <span className="text-body-sm uppercase tracking-[0.16em]">
                    {block.cta.label}
                  </span>
                </GlassPanel>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
