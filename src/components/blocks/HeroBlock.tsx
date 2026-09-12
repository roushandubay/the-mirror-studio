"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import SplitText from "@/components/motion/SplitText";
import Magnetic from "@/components/motion/Magnetic";
import { blockStyle } from "@/lib/blocks/style";
import type { HeroBlock as HeroBlockData } from "@/lib/blocks/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Figma Hero (1440x629): full-bleed photo under a 60% #14010A scrim, 44px bold
 * white headline, outline CTA, 80px arrow rails, 3 progress bars.
 * Motion added on top: a slow Ken Burns push on the live slide, a cross-dissolve
 * between slides, per-word headline reveal, and dots that fill with the timer.
 */
export default function HeroBlock({ block }: { block: HeroBlockData }) {
  const reduced = useReducedMotion();
  const slides = block.slides;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const height = block.height ?? 629;
  const autoplay = block.autoplayMs ?? 6000;

  const go = useCallback(
    (next: number) => {
      setDir(next > index || (index === slides.length - 1 && next === 0) ? 1 : -1);
      setIndex((next + slides.length) % slides.length);
    },
    [index, slides.length],
  );

  useEffect(() => {
    if (slides.length < 2 || autoplay <= 0) return;
    const t = setTimeout(() => go(index + 1), autoplay);
    return () => clearTimeout(t);
  }, [index, autoplay, slides.length, go]);

  const slide = slides[index];
  if (!slide) return null;

  return (
    <section
      data-node-id="1058:9324"
      aria-roledescription="carousel"
      className="relative w-full overflow-hidden bg-line"
      style={{ height, ...blockStyle(block.style) }}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0, x: reduced ? 0 : dir * 64 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduced ? 0 : dir * -64 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0"
            initial={reduced ? undefined : { scale: 1.12 }}
            animate={reduced ? undefined : { scale: 1 }}
            transition={{ duration: (autoplay + 1500) / 1000, ease: "linear" }}
          >
            <Image
              src={slide.image.src}
              alt={slide.image.alt ?? ""}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.image.focal ?? "50% 50%" }}
            />
          </motion.div>
          <div
            aria-hidden
            className="absolute inset-0 bg-primary-900"
            style={{ opacity: slide.overlay ?? 0.6 }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-20 text-center">
        <SplitText
          key={`h-${slide.id}`}
          as="h1"
          text={slide.heading}
          by="words"
          inView={false}
          stagger={0.07}
          delay={0.25}
          className="max-w-[900px] text-[clamp(28px,5vw,44px)] font-bold capitalize leading-[1.4] text-white"
        />

        {slide.cta && (
          <motion.div
            key={`c-${slide.id}`}
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: EASE }}
          >
            <Magnetic strength={0.3}>
              <Button link={slide.cta} className="w-[184px]" />
            </Magnetic>
          </motion.div>
        )}
      </div>

      {block.showArrows !== false && slides.length > 1 && (
        <>
          <HeroArrow side="left" onClick={() => go(index - 1)} height={height} />
          <HeroArrow side="right" onClick={() => go(index + 1)} height={height} />
        </>
      )}

      {block.showDots !== false && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-1">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className="h-1 w-6 overflow-hidden bg-white/40"
            >
              {i === index && (
                <motion.span
                  className="block h-full bg-white"
                  initial={{ width: reduced ? "100%" : 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: reduced ? 0 : autoplay / 1000, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        Slide {index + 1} of {slides.length}
      </span>
    </section>
  );
}

function HeroArrow({
  side,
  onClick,
  height,
}: {
  side: "left" | "right";
  onClick: () => void;
  height: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className="group absolute top-0 z-20 hidden w-20 items-center justify-center bg-[rgba(12,12,12,0.4)] transition-colors duration-500 hover:bg-[rgba(12,12,12,0.65)] md:flex"
      style={{ height, [side]: 0 }}
    >
      <motion.span
        className="block"
        whileHover={{ x: side === "left" ? -6 : 6 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <Image
          src={side === "left" ? "/figma/arrow-left.svg" : "/figma/arrow-right.svg"}
          alt=""
          width={40}
          height={40}
        />
      </motion.span>
    </button>
  );
}
