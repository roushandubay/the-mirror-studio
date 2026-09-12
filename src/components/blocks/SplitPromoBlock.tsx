"use client";

import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { blockStyle, wellStyle } from "@/lib/blocks/style";
import type { SplitPromoBlock as SplitPromoBlockData } from "@/lib/blocks/types";

/**
 * Figma "skin type" promo (1224x281): dark primary-750 panel, copy in a 496px
 * column with 104px inset, artwork filling the right 600px, and an optional
 * 100x100 QR straddling the seam.
 */
export default function SplitPromoBlock({ block }: { block: SplitPromoBlockData }) {
  const mediaRight = (block.mediaSide ?? "right") === "right";

  return (
    <section data-node-id="2023:16085" className="w-full py-10" style={blockStyle(block.style)}>
      <div className="well" style={wellStyle(block.style)}>
        <Reveal anim={block.anim ?? { on: "rise" }}>
          <div
            className={cn(
              "relative grid overflow-hidden bg-primary-750 text-white",
              "lg:grid-cols-2 lg:items-stretch",
              !mediaRight && "lg:[&>*:first-child]:order-2",
            )}
            style={{ borderRadius: "var(--block-radius, 0px)" }}
          >
            <div className="flex flex-col justify-center gap-4 px-8 py-10 lg:min-h-[281px] lg:px-[104px]">
              <h2 className="text-h4 font-bold capitalize">{block.heading}</h2>
              {block.body && <p className="max-w-[496px] text-body-sm">{block.body}</p>}
              {block.kicker && (
                <p className="mt-2 text-body-sm font-semibold capitalize">{block.kicker}</p>
              )}
              {block.divider && <p className="text-body-md lowercase">{block.divider}</p>}
              {block.cta && (
                <div className="mt-2">
                  <Button link={block.cta} />
                </div>
              )}
            </div>

            <div className="relative min-h-[220px] lg:min-h-[281px]">
              <Parallax distance={40} className="absolute inset-0 overflow-hidden">
                <div className="relative h-[calc(100%+40px)] w-full">
                  <Image
                    src={block.image.src}
                    alt={block.image.alt ?? ""}
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                    style={{ objectPosition: block.image.focal ?? "50% 50%" }}
                  />
                </div>
              </Parallax>

              {block.qr && (
                <div className="absolute left-0 top-1/2 hidden h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 bg-white p-1 lg:block">
                  <Image
                    src={block.qr.src}
                    alt={block.qr.alt ?? "Scan to start"}
                    width={100}
                    height={100}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
