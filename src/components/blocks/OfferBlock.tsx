"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Button from "@/components/ui/Button";
import SplitText from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import { blockStyle, wellStyle } from "@/lib/blocks/style";
import type { OfferBlock as Data } from "@/lib/blocks/types";

/**
 * Figma "special offers" (1440x382, primary-25 band): product photography on
 * one side with a circular discount badge, a 600px copy column on the other.
 * The badge counter-rotates slowly so the band never reads as static.
 */
export default function OfferBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const mediaLeft = (block.mediaSide ?? "left") === "left";

  return (
    <section
      data-node-id="1329:8927"
      className="w-full overflow-hidden bg-primary-25 py-16"
      style={blockStyle(block.style)}
    >
      <div
        className={cn("well grid items-center gap-10 lg:grid-cols-2", !mediaLeft && "lg:[&>*:first-child]:order-2")}
        style={wellStyle(block.style)}
      >
        <Reveal anim={{ on: "scale-in", duration: 0.9 }} className="relative">
          <div className="relative aspect-[575/382] w-full overflow-hidden">
            <Image
              src={block.image.src}
              alt={block.image.alt ?? ""}
              fill
              sizes="(max-width: 1024px) 100vw, 575px"
              className="object-cover"
              style={{ objectPosition: block.image.focal ?? "50% 50%" }}
            />
          </div>
          {block.badge && (
            <motion.div
              className="absolute -left-2 top-1/2 h-[132px] w-[132px] -translate-y-1/2 lg:h-[180px] lg:w-[180px]"
              animate={reduced ? undefined : { rotate: 360 }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            >
              <Image
                src={block.badge.src}
                alt={block.badge.alt ?? ""}
                fill
                className="object-contain"
              />
            </motion.div>
          )}
        </Reveal>

        <Reveal anim={block.anim} className="flex flex-col gap-3">
          {block.eyebrow && (
            <p className="text-h4 font-bold capitalize text-ink">{block.eyebrow}</p>
          )}
          <SplitText
            as="h2"
            text={block.heading}
            by="chars"
            stagger={0.025}
            className="block text-h3 font-bold capitalize text-primary"
          />
          {block.body && <p className="max-w-[600px] text-body-md text-ink">{block.body}</p>}
          {block.footnote && (
            <p className="max-w-[600px] text-body-sm font-bold capitalize text-primary">
              {block.footnote}
            </p>
          )}
          {block.cta && (
            <div className="mt-4 self-start lg:self-end">
              <Button link={block.cta} />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
