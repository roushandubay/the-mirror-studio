"use client";

import BlogCard from "@/components/ui/BlogCard";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { blockStyle, gridStyle, wellStyle } from "@/lib/blocks/style";
import type { BlogBlock as Data } from "@/lib/blocks/types";

/** Figma "our blog" (1224x474): three 392px cards with a "View All" at top-right. */
export default function BlogBlock({ block }: { block: Data }) {
  return (
    <section data-node-id="1058:9006" className="w-full py-20" style={blockStyle(block.style)}>
      <div className="well" style={wellStyle(block.style)}>
        <div className="relative flex items-center justify-center">
          <SectionHeading align="center">{block.heading}</SectionHeading>
          {block.viewAll && (
            <div className="absolute right-0 hidden lg:block">
              <Button link={{ ...block.viewAll, variant: block.viewAll.variant ?? "ghost" }} />
            </div>
          )}
        </div>

        <Reveal
          group
          anim={block.anim}
          as="ul"
          className="mt-12 grid md:grid-cols-2 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
          style={gridStyle(block.style, 3)}
        >
          {block.items.map((item) => (
            <RevealItem key={item.id} as="li" duration={0.75}>
              <BlogCard item={item} />
            </RevealItem>
          ))}
        </Reveal>

        {block.viewAll && (
          <div className="mt-8 flex justify-center lg:hidden">
            <Button link={{ ...block.viewAll, variant: "ghost" }} />
          </div>
        )}
      </div>
    </section>
  );
}
