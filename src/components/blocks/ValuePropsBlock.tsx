"use client";

import Image from "next/image";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { blockStyle } from "@/lib/blocks/style";
import type { ValuePropsBlock as Data } from "@/lib/blocks/types";

/**
 * Figma "value proposition" strip (1440x104, primary-25) — 108px gutters, four
 * icon+label pairs spread edge to edge.
 */
export default function ValuePropsBlock({ block }: { block: Data }) {
  return (
    <section
      data-node-id="I2024:15497;951:6611"
      className="w-full bg-primary-25"
      style={blockStyle(block.style)}
    >
      <Reveal
        group
        anim={{ stagger: 0.08, ...block.anim }}
        as="ul"
        className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-6 px-6 py-6 lg:px-[108px]"
      >
        {block.items.map((item) => (
          <RevealItem key={item.id} as="li" duration={0.6} className="flex items-center gap-4">
            <Image
              src={item.icon.src}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="text-body-md capitalize text-primary-600">{item.label}</span>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
