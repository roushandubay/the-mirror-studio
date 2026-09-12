"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import DisplayLine, { DisplayStatic } from "@/components/ui/DisplayLine";
import MediaFill from "@/components/ui/MediaFill";
import { cn } from "@/lib/cn";
import { blockStyle } from "@/lib/blocks/style";
import { useIsMobile } from "@/lib/useViewport";
import type { StepperBlock as Data, StepperStep } from "@/lib/blocks/types";

/** progress spent growing from thumbnail to full bleed, before the steps run */
const GROW_END = 0.2;

/**
 * The studio's process, told as a pinned stepper.
 *
 * Three behaviours, matching the reference site exactly:
 *
 *  1. GROW — the frame starts as a small thumbnail and scales to full bleed
 *     over the first fifth of the scroll.
 *  2. SLIDE — each following step is a full-bleed panel with a HARD edge that
 *     slides up over the one before it. It is not a crossfade; the seam stays
 *     crisp, which is what makes it read as a curtain rather than a dissolve.
 *     The photo inside counter-drifts sideways and is scaled by `overscan` so
 *     the drift can never expose an edge.
 *  3. CAPTION — one persistent sentence sits at the bottom the whole time and
 *     the active fragment brightens. The caption is never swapped out.
 */
export default function StepperBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const steps = block.steps;
  const length = block.scrollLength ?? 4;
  const t = block.transition ?? {};
  const slide = (t.style ?? "slide-up") === "slide-up";
  const drift = t.drift ?? 100;
  const overscan = t.overscan ?? 1.14;
  const travel = t.travel ?? 0.55;

  const slot = (1 - GROW_END) / steps.length;

  const [active, setActive] = useState(0);
  const [grown, setGrown] = useState(false);

  const scale = useTransform(scrollYProgress, [0, GROW_END], [0.16, 1]);
  const radius = useTransform(scrollYProgress, [0, GROW_END], [4, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setGrown(v >= GROW_END * 0.6);
    const i = Math.floor((v - GROW_END) / slot);
    setActive(Math.min(steps.length - 1, Math.max(0, i)));
  });

  return (
    <div
      ref={ref}
      className="relative w-full bg-canvas"
      style={{ height: `${length * 100}svh`, ...blockStyle(block.style) }}
    >
      <div className="pin-stage flex items-center justify-center">
        {/* pre-roll heading, dissolves as the frame grows */}
        {block.heading && (
          <div
            className="pointer-events-none absolute inset-x-0 z-30 px-6 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ opacity: reduced ? 1 : grown ? 0 : 1 }}
          >
            <DisplayLine
              text={block.heading}
              className="text-d3 font-light leading-[1.05] text-primary-900"
            />
          </div>
        )}

        {/* the growing frame, holding the stack of step panels */}
        <motion.div
          className="relative h-full w-full overflow-hidden"
          style={reduced ? undefined : { scale, borderRadius: radius }}
        >
          {steps.map((step, i) => (
            <StepPanel
              key={step.id}
              step={step}
              index={i}
              progress={scrollYProgress}
              slot={slot}
              travel={travel}
              drift={drift}
              overscan={overscan}
              slide={slide}
              reduced={!!reduced}
            />
          ))}

          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-20 h-2/5 bg-gradient-to-t from-primary-900/75 to-transparent"
          />

          {/* one persistent caption; only the active fragment brightens */}
          <div className="absolute inset-x-0 bottom-0 z-30 px-6 pb-10 lg:px-16 lg:pb-12">
            <p className="flex flex-wrap items-baseline gap-x-[0.3em] gap-y-1 font-display text-[clamp(20px,3.6vw,52px)] font-light leading-[1.1] text-white">
              {steps.map((s, i) => (
                <DisplayStatic
                  key={s.id}
                  text={s.segment}
                  className="transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ opacity: i === active ? 1 : 0.42 }}
                />
              ))}
            </p>
          </div>
        </motion.div>

        {/* diamond progress rail */}
        {block.showRail !== false && (
          <div className="absolute left-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
            {steps.map((s, i) => (
              <span
                key={s.id}
                aria-hidden
                className={cn(
                  "block h-[7px] w-[7px] rotate-45 transition-all duration-500",
                  i === active ? "bg-white" : "bg-white/35",
                )}
                style={{ transform: `rotate(45deg) scale(${i === active ? 1.35 : 1})` }}
              />
            ))}
          </div>
        )}

        <span className="sr-only" aria-live="polite">
          Step {active + 1} of {steps.length}: {steps[active]?.label}
        </span>
      </div>
    </div>
  );
}

function StepPanel({
  step,
  index,
  progress,
  slot,
  travel,
  drift,
  overscan,
  slide,
  reduced,
}: {
  step: StepperStep;
  index: number;
  progress: MotionValue<number>;
  slot: number;
  travel: number;
  drift: number;
  overscan: number;
  slide: boolean;
  reduced: boolean;
}) {
  const isMobile = useIsMobile();
  // Panel i finishes arriving exactly when step i becomes active
  const end = GROW_END + index * slot;
  const start = end - travel * slot;

  // Panel 0 is the bed everything else slides over, so it never moves.
  // Output ranges stay homogeneous (all strings / all numbers) — mixing them
  // gives useTransform no single overload to match.
  const base = index === 0;
  const y = useTransform(progress, [start, end], base ? ["0%", "0%"] : ["100%", "0%"]);
  const x = useTransform(progress, [start, end], base ? [0, 0] : [drift, 0]);
  const opacity = useTransform(progress, [start, end], base ? [1, 1] : [0, 1]);

  const moving = !reduced && slide;
  const style: MotionStyle = { zIndex: index + 1 };
  if (moving) style.y = y;
  // Without slide-up the panels simply cross-fade
  if (!slide && !reduced) style.opacity = opacity;

  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={style}>
      <motion.div
        className="absolute inset-0"
        style={moving ? { x, scale: overscan } : { scale: overscan }}
      >
        <MediaFill
          media={step.image}
          src={isMobile && step.image.srcMobile ? step.image.srcMobile : step.image.src}
          fit={isMobile ? step.image.fitMobile ?? "cover" : step.image.fit ?? "cover"}
          alt={step.image.alt ?? step.label}
          sizes="100vw"
        />
      </motion.div>

      <span className="absolute left-6 top-8 z-10 text-overline uppercase tracking-[0.22em] text-white/70 lg:left-16">
        {step.label}
      </span>
    </motion.div>
  );
}
