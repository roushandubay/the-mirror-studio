"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import SplitText from "@/components/motion/SplitText";
import Parallax from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { blockStyle, wellStyle } from "@/lib/blocks/style";
import type { BrandBlock as Data } from "@/lib/blocks/types";

/** Figma "our brand" (1224x269): copy in a 600px column, 496x269 portrait right. */
export default function BrandBlock({ block }: { block: Data }) {
  return (
    <section data-node-id="1058:9051" className="w-full py-20" style={blockStyle(block.style)}>
      <div
        className="well grid items-center gap-10 lg:grid-cols-[1fr_496px]"
        style={wellStyle(block.style)}
      >
        <Reveal anim={block.anim} className="flex flex-col gap-4 lg:pl-[104px]">
          <SplitText
            as="h2"
            text={block.heading}
            by="words"
            className="block text-h3 font-bold capitalize text-ink"
          />
          <p className="max-w-[600px] text-body-md text-ink">{block.body}</p>
          {block.cta && (
            <div className="mt-2 self-start">
              <Button link={block.cta} />
            </div>
          )}
        </Reveal>

        <Reveal anim={{ on: "mask-wipe", duration: 1 }}>
          <Parallax distance={50} className="relative aspect-[496/269] w-full overflow-hidden">
            <div className="relative h-[calc(100%+50px)] w-full">
              <Image
                src={block.image.src}
                alt={block.image.alt ?? ""}
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 496px"
                className="object-cover"
                style={{ objectPosition: block.image.focal ?? "50% 50%" }}
              />
            </div>
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}
