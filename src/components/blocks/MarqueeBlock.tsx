"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Fragment, useRef } from "react";
import { DisplayStatic } from "@/components/ui/DisplayLine";
import { blockStyle } from "@/lib/blocks/style";
import { cn } from "@/lib/cn";
import type { MarqueeBlock as Data } from "@/lib/blocks/types";

const TONES = {
  dark: "bg-primary-900 text-white",
  accent: "bg-primary text-white",
  light: "bg-canvas text-primary-900",
} as const;

/**
 * A running line of display type.
 *
 * It is not a CSS keyframe loop: the offset is advanced every frame, and the
 * page's scroll velocity (smoothed on a spring) is added to it. Scroll down and
 * the band surges forward and leans into the motion; scroll up and it runs
 * backwards. When the page is still it settles back to a slow drift.
 */
export default function MarqueeBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const skew = useTransform(velocity, [-2500, 2500], [8, -8], { clamp: true });

  const direction = useRef(1);
  const speed = block.speed ?? 28;

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (!half) return;

    let move = direction.current * (half / speed) * (delta / 1000);
    if (block.reactive !== false) {
      const f = factor.get();
      if (f < 0) direction.current = -1;
      else if (f > 0) direction.current = 1;
      move += move * Math.abs(f);
    }

    let next = x.get() - move;
    // wrap seamlessly: the content is doubled, so half its width is one loop
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  const run = (
    <>
      {block.items.map((item, i) => (
        <Fragment key={i}>
          <DisplayStatic text={item} className="whitespace-nowrap" />
          <span aria-hidden className="mx-[0.6em] inline-block translate-y-[-0.1em] text-[0.4em] opacity-60">
            ◆
          </span>
        </Fragment>
      ))}
    </>
  );

  return (
    <section
      id={block.id}
      className={cn("relative w-full overflow-hidden py-6 lg:py-9", TONES[block.tone ?? "dark"])}
      style={blockStyle(block.style)}
      aria-label={block.items.join(" · ").replace(/_/g, "")}
    >
      <motion.div style={reduced || block.reactive === false ? undefined : { skewX: skew }}>
        <motion.div
          ref={trackRef}
          aria-hidden
          className="flex w-max items-center font-display text-[clamp(40px,7vw,110px)] font-light leading-none"
          style={{ x }}
        >
          {/* doubled, then doubled again so short phrases still overflow wide screens */}
          <span className="flex items-center">{run}{run}</span>
          <span className="flex items-center">{run}{run}</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
