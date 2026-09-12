"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import ProductCard from "@/components/ui/ProductCard";
import SplitText from "@/components/motion/SplitText";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { blockStyle, wellStyle } from "@/lib/blocks/style";
import type { FeatureRowBlock as Data } from "@/lib/blocks/types";

/**
 * Figma "New in" band (1440x768, full-bleed primary-750): a 600px editorial
 * card whose 436px image sits above a 100px copy well, followed by two standard
 * product cards.
 */
export default function FeatureRowBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ed = block.editorial;

  return (
    <section
      data-node-id="2070:16020"
      className="w-full bg-primary-750 py-[38px] text-white"
      style={blockStyle(block.style)}
    >
      <div className="well py-16" style={wellStyle(block.style)}>
        <SplitText
          as="h2"
          text={block.heading}
          by="words"
          className="block text-center text-h3 font-bold capitalize text-white"
        />

        <Reveal group anim={block.anim} className="mt-16 grid gap-6 lg:grid-cols-[600px_1fr_1fr]">
          <RevealItem name="mask-wipe" duration={0.95}>
            <Link href={ed.href ?? "#"} className="group flex h-full flex-col">
              <div className="relative aspect-[600/436] w-full overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  whileHover={reduced ? undefined : { scale: 1.06 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={ed.image.src}
                    alt={ed.image.alt ?? ed.heading}
                    fill
                    loading="eager"
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                    style={{ objectPosition: ed.image.focal ?? "50% 50%" }}
                  />
                </motion.div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <h3 className="text-h4 font-bold capitalize">{ed.heading}</h3>
                {ed.body && <p className="text-body-md text-white/80">{ed.body}</p>}
              </div>
            </Link>
          </RevealItem>

          {block.items.map((item) => (
            <RevealItem key={item.id} duration={0.75}>
              <ProductCard item={item} />
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
