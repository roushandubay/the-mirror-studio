"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import DisplayLine, { DisplayStatic } from "@/components/ui/DisplayLine";
import GlassCta, { TextCta } from "@/components/ui/GlassCta";
import { blockStyle } from "@/lib/blocks/style";
import { cn } from "@/lib/cn";
import type { UspFeatureBlock as Data, UspDay } from "@/lib/blocks/types";

const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;
/** share of the pin spent on the intro, before the days take over */
const INTRO = 0.3;
const NUMBER_WORDS = ["ONE", "TWO", "THREE", "FOUR", "FIVE"];

/**
 * "Learn Makeup In Three Days" — the studio's headline offer.
 *
 * FULL: a pinned scrub on a dark ground. Pigment dust gathers into a "3", then
 * into "DAYS", while the promise is set beside it. Then each day takes the
 * stage in turn and the dust re-forms into that day's number, so the particle
 * shape and the copy always agree.
 *
 * TEASER: one screen, not pinned. The dust cycles on its own clock; used where
 * the course is mentioned but is not the subject of the page.
 */
export default function UspFeatureBlock({ block }: { block: Data }) {
  if (block.variant === "teaser") return <Teaser block={block} />;
  return <Full block={block} />;
}

function Full({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const days = block.days;
  const slot = (1 - INTRO) / days.length;
  // Spelled out: Cormorant's numerals are old-style (a "3" hangs below the
  // baseline and reads as a hook in dust), while its capitals are unmistakable.
  const words = ["THREE", "DAYS", ...days.map((_, i) => NUMBER_WORDS[i] ?? String(i + 1))];
  const lastState = words.length; // state 0 is the loose cloud

  // Particle progress: cloud -> 3 -> DAYS through the intro, then each day's
  // number lands exactly as that day's copy becomes active.
  const keysP = [0, INTRO * 0.4, INTRO * 0.85, ...days.map((_, i) => INTRO + slot * (i + 0.35)), 1];
  const keysS = [0, 1, 2, ...days.map((_, i) => 3 + i), 2 + days.length];
  const particleProgress = useTransform(scrollYProgress, keysP, keysS.map((s) => s / lastState));

  const [active, setActive] = useState(-1);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = v < INTRO ? -1 : Math.min(days.length - 1, Math.floor((v - INTRO) / slot));
    setActive((prev) => (prev === i ? prev : i));
  });


  return (
    <div
      ref={ref}
      id={block.id}
      className="relative w-full bg-primary-900 text-white"
      style={{ height: `${(block.scrollLength ?? 2.6) * 100}svh`, ...blockStyle(block.style) }}
    >
      <div className="pin-stage">
        {/* scene: right side on desktop; on phones a faint backdrop, far too
            dim to fight the copy laid over it */}
        <div className="absolute inset-0 opacity-20 lg:left-[46%] lg:opacity-100">
          <SceneCanvas scene="particles" words={words} progress={particleProgress} />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-900/60 to-transparent"
        />
        <div aria-hidden className="grain pointer-events-none absolute inset-0" />

        <div className="relative z-10 flex h-full w-full flex-col px-6 pb-8 pt-24 lg:px-16 lg:pb-12 lg:pt-28">
          {block.eyebrow && (
            <p className="flex items-center gap-3 text-overline uppercase tracking-[0.28em] text-primary-100">
              <span className="inline-block h-[7px] w-[7px] rotate-45 bg-primary-200" />
              {block.eyebrow}
            </p>
          )}

          {/* The copy column stops at 44% on desktop, before the dust begins,
              so no heading, day title or bullet can ever run under the word */}
          <div className="relative flex-1 lg:w-[calc(44vw-4rem)]">
            {/* intro — toggled from `active` like the day panels, NOT a
                scroll-linked opacity: Motion hands scroll-linked opacity to a
                native scroll timeline, which measured this pinned section's
                range differently and left the intro half-visible over Day 02 */}
            <motion.div
              className="absolute inset-0 flex flex-col justify-center"
              initial={false}
              animate={active === -1 ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : -40 }}
              transition={{ duration: 0.6, ease: EASE }}
              aria-hidden={active !== -1}
            >
              <DisplayLine
                text={block.heading}
                align="left"
                className="max-w-[12ch] text-[clamp(44px,6.2vw,96px)] font-light leading-[0.94] text-white"
              />
              {block.body && <p className="mt-6 max-w-[44ch] text-body-md text-white/70 lg:text-body-lg">{block.body}</p>}
              {block.highlights && (
                <ul className="mt-6 flex max-w-[560px] flex-wrap gap-2">
                  {block.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-overline uppercase tracking-[0.18em] text-white/80"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            {/* the days */}
            {days.map((day, i) => (
              <DayPanel
                key={day.id}
                day={day}
                active={active === i}
                reduced={!!reduced}
                progress={scrollYProgress}
                start={INTRO + i * slot}
                slot={slot}
              />
            ))}
          </div>

          {/* footer row: progress rail + CTAs, pinned for the whole scrub */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <DayRail days={days} progress={scrollYProgress} slot={slot} active={active} />
            <div className="flex flex-wrap items-center gap-6">
              {block.cta && <GlassCta link={block.cta} />}
              {block.secondaryCta && <TextCta link={block.secondaryCta} className="hidden sm:inline-flex" />}
            </div>
          </div>
        </div>

        <span className="sr-only" aria-live="polite">
          {active >= 0 ? `${days[active].label}: ${days[active].title.replace(/_/g, "")}` : ""}
        </span>
      </div>
    </div>
  );
}

function DayPanel({
  day,
  active,
  reduced,
  progress,
  start,
  slot,
}: {
  day: UspDay;
  active: boolean;
  reduced: boolean;
  progress: MotionValue<number>;
  start: number;
  slot: number;
}) {
  // Continuous drift through the day's own slot, so every wheel tick visibly
  // moves something — without it a day holds perfectly still for a third of
  // the pin and the page feels as if it has stopped scrolling. Driven from the
  // change event rather than useTransform so Motion cannot hand it to a native
  // scroll timeline (see the intro note above).
  const drift = useMotionValue(0);
  useMotionValueEvent(progress, "change", (v) => {
    if (reduced) return;
    const t = Math.min(1, Math.max(0, (v - start) / slot));
    drift.set(36 - t * 72);
  });

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex flex-col justify-center"
      initial={false}
      animate={active ? "on" : "off"}
      variants={{
        on: { opacity: 1, transition: { staggerChildren: reduced ? 0 : 0.07, delayChildren: 0.1 } },
        off: { opacity: 0, transition: { duration: 0.35 } },
      }}
      aria-hidden={!active}
    >
      <motion.div style={{ y: drift }}>
        <motion.p
          className="font-display text-d5 italic text-primary-100"
          variants={{ on: { opacity: 1, y: 0 }, off: { opacity: 0, y: 20 } }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {day.label}
        </motion.p>
        <motion.div
          variants={{ on: { opacity: 1, y: 0 }, off: { opacity: 0, y: 40 } }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <DisplayStatic
            as="h3"
            text={day.title}
            className="mt-2 block max-w-[14ch] font-display text-[clamp(34px,4.6vw,72px)] font-light leading-[0.98]"
          />
        </motion.div>
        {/* phones show the first four points — six would run into the rail */}
        <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2 max-sm:[&>li:nth-child(n+5)]:hidden lg:mt-8 lg:gap-y-3">
          {day.points.map((pt) => (
            <motion.li
              key={pt}
              className="flex gap-3 border-t border-white/15 pt-2.5 text-body-sm text-white/80 lg:pt-3 lg:text-body-md"
              variants={{ on: { opacity: 1, y: 0 }, off: { opacity: 0, y: 16 } }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <span aria-hidden className="mt-[0.7em] inline-block h-[5px] w-[5px] shrink-0 rotate-45 bg-primary-200" />
              {pt}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

function DayRail({
  days,
  progress,
  slot,
  active,
}: {
  days: UspDay[];
  progress: MotionValue<number>;
  slot: number;
  active: number;
}) {
  return (
    <ol className="flex w-full max-w-[520px] gap-3">
      {days.map((d, i) => (
        <RailSegment key={d.id} label={d.label} index={i} progress={progress} slot={slot} active={active === i} />
      ))}
    </ol>
  );
}

function RailSegment({
  label,
  index,
  progress,
  slot,
  active,
}: {
  label: string;
  index: number;
  progress: MotionValue<number>;
  slot: number;
  active: boolean;
}) {
  const start = INTRO + index * slot;
  const fill = useTransform(progress, [start, start + slot], [0, 1]);
  return (
    <li className="flex-1">
      <span
        className={cn(
          "mb-2 block text-overline uppercase tracking-[0.2em] transition-colors duration-500",
          active ? "text-white" : "text-white/40",
        )}
      >
        {label}
      </span>
      <span className="block h-px w-full bg-white/15">
        <motion.span className="block h-full origin-left bg-primary-200" style={{ scaleX: fill }} />
      </span>
    </li>
  );
}

function Teaser({ block }: { block: Data }) {
  return (
    <section
      id={block.id}
      className="relative w-full overflow-hidden bg-primary-900 text-white"
      style={blockStyle(block.style)}
    >
      <div className="absolute inset-0 opacity-20 lg:left-[46%] lg:opacity-100">
        <SceneCanvas scene="particles" words={["THREE", "DAYS"]} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-900/70 to-transparent"
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />

      {/* copy stops at 44vw on desktop — the dust starts at 46% */}
      <div className="relative z-10 flex min-h-[86svh] flex-col justify-center px-6 py-28 lg:max-w-[44vw] lg:pl-16 lg:pr-0">
        {block.eyebrow && (
          <p className="mb-6 text-overline uppercase tracking-[0.28em] text-primary-100">{block.eyebrow}</p>
        )}
        <DisplayLine
          text={block.heading}
          align="left"
          className="max-w-[12ch] text-[clamp(40px,5.4vw,88px)] font-light leading-[0.96] text-white"
        />
        {block.body && <p className="mt-8 max-w-[46ch] text-body-lg text-white/70">{block.body}</p>}

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {block.days.map((d, i) => (
            <motion.li
              key={d.id}
              className="border-t border-white/20 pt-4"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ delay: i * 0.12, duration: 0.8, ease: EASE }}
            >
              <span className="text-overline uppercase tracking-[0.2em] text-primary-100">{d.label}</span>
              <DisplayStatic
                as="span"
                text={d.title}
                className="mt-2 block font-display text-[clamp(22px,2vw,30px)] font-light leading-[1.1]"
              />
            </motion.li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-6">
          {block.cta && <GlassCta link={block.cta} />}
          {block.secondaryCta && <TextCta link={block.secondaryCta} />}
        </div>
      </div>
    </section>
  );
}
