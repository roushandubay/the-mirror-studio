"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import Magnetic from "@/components/motion/Magnetic";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import { blockStyle, wellStyle } from "@/lib/blocks/style";
import type { ProductCarouselBlock as Data } from "@/lib/blocks/types";

/**
 * Figma "Our Best Sellers" (1224 wide, 4 x 288 cards with 24px gutters and
 * arrows hanging 20px outside the well). Scrolling is native scroll-snap so it
 * stays usable on touch; the arrows page it by one card width.
 */
export default function ProductCarouselBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const perView = block.perView ?? 4;

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const page = (delta: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.clientWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * delta, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section data-node-id="1058:9011" className="w-full py-20" style={blockStyle(block.style)}>
      <div className="well" style={wellStyle(block.style)}>
        <SectionHeading align={block.style?.align ?? "center"}>{block.heading}</SectionHeading>

        <div className="relative mt-12">
          <Reveal
            group
            anim={block.anim}
            as="ul"
            innerRef={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
          >
            {block.items.map((item) => (
              <RevealItem
                key={item.id}
                as="li"
                duration={0.7}
                className="w-[260px] shrink-0 snap-start sm:w-[288px]"
                style={{ flexBasis: `calc((100% - ${(perView - 1) * 24}px) / ${perView})` }}
              >
                <ProductCard item={item} />
              </RevealItem>
            ))}
          </Reveal>

          {block.showArrows !== false && (
            <>
              <CarouselArrow dir="left" disabled={atStart} onClick={() => page(-1)} />
              <CarouselArrow dir="right" disabled={atEnd} onClick={() => page(1)} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function CarouselArrow({
  dir,
  onClick,
  disabled,
  tone = "light",
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "absolute top-1/2 z-20 hidden -translate-y-1/2 lg:block",
        disabled ? "pointer-events-none opacity-0" : "opacity-100",
        "transition-opacity duration-300",
        dir === "left" ? "-left-5" : "-right-5",
      )}
    >
      <Magnetic strength={0.4}>
        <motion.button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={dir === "left" ? "Previous" : "Next"}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full shadow-lg",
            tone === "light" ? "bg-white" : "bg-primary-800",
          )}
        >
          <Image
            src={dir === "left" ? "/figma/arrow-left.svg" : "/figma/arrow-right.svg"}
            alt=""
            width={32}
            height={32}
            className={tone === "light" ? "invert" : ""}
          />
        </motion.button>
      </Magnetic>
    </div>
  );
}
