"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { blockStyle, gridStyle, wellStyle } from "@/lib/blocks/style";
import type { CategoriesBlock as CategoriesBlockData } from "@/lib/blocks/types";

/**
 * Figma "category frame" (808x390 centred): three 256x342 images each with a
 * 32px label beneath. Cards wipe up from a mask and the photo pushes in behind
 * a tinted veil on hover.
 */
export default function CategoriesBlock({ block }: { block: CategoriesBlockData }) {
  const reduced = useReducedMotion();

  return (
    <section
      data-node-id="1058:9027"
      className="w-full py-20"
      style={blockStyle(block.style)}
    >
      <div className="well" style={wellStyle(block.style)}>
        <SectionHeading align={block.style?.align ?? "center"}>{block.heading}</SectionHeading>

        <Reveal
          group
          anim={block.anim}
          as="ul"
          className="mx-auto mt-16 grid w-full max-w-[808px] sm:grid-cols-2 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
          style={gridStyle(block.style, 3)}
        >
          {block.items.map((item) => (
            <RevealItem key={item.id} as="li" name="mask-wipe" duration={0.9}>
              <Link href={item.href} className="group block">
                <div className="relative aspect-[256/342] w-full overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    whileHover={reduced ? undefined : { scale: 1.08 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src={item.image.src}
                      alt={item.image.alt ?? item.label}
                      fill
                      loading="eager"
                      sizes="(max-width: 640px) 90vw, 256px"
                      className="object-cover"
                      style={{ objectPosition: item.image.focal ?? "50% 50%" }}
                    />
                  </motion.div>
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-primary-900/0 transition-colors duration-500 group-hover:bg-primary-900/25"
                  />
                </div>
                <p className="mt-4 text-center text-h6 font-bold capitalize text-ink transition-colors duration-300 group-hover:text-primary">
                  {item.label}
                </p>
              </Link>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
