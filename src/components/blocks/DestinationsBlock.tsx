"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import DisplayLine from "@/components/ui/DisplayLine";
import GlassCta from "@/components/ui/GlassCta";
import { blockStyle } from "@/lib/blocks/style";
import type { DestinationsBlock as Data } from "@/lib/blocks/types";

const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Where the studio travels.
 *
 * Desktop: the globe is pinned on the left for the length of the section while
 * the regions scroll past on the right — so the globe turns from India toward
 * the Gulf and Europe exactly as those regions come up in the list. Phones get
 * the globe as a full-width stage above the list.
 *
 * Each region's cities fill in word by word, and the travel notes are numbered
 * steps so the process reads as simple.
 */
export default function DestinationsBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section
      ref={ref}
      id={block.id}
      className="relative w-full bg-primary-900 text-white"
      style={blockStyle(block.style)}
    >
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-[1500px] lg:grid-cols-[1.05fr_1fr]">
        {/* the globe */}
        {/* self-start: a stretched grid item has nowhere to stick */}
        <div className="relative h-[72svh] lg:sticky lg:top-0 lg:h-[100svh] lg:self-start">
          <SceneCanvas scene={block.scene ?? "globe"} progress={scrollYProgress} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-900 to-transparent lg:hidden"
          />
          <p className="pointer-events-none absolute bottom-8 left-6 flex items-center gap-3 text-overline uppercase tracking-[0.24em] text-white/60 lg:left-16">
            <span className="relative flex h-2.5 w-2.5">
              {!reduced && <span className="absolute inset-0 animate-ping rounded-full bg-primary-200/70" />}
              <span className="relative h-2.5 w-2.5 rounded-full bg-primary-200" />
            </span>
            Siliguri — home studio
          </p>
        </div>

        {/* the words */}
        <div className="px-6 pb-28 pt-6 lg:px-16 lg:py-40">
          {block.eyebrow && (
            <p className="mb-6 text-overline uppercase tracking-[0.28em] text-primary-100">{block.eyebrow}</p>
          )}
          <DisplayLine text={block.heading} align="left" className="text-d3 font-light leading-[1] text-white" />
          {block.body && <p className="mt-8 max-w-[48ch] text-body-lg leading-[1.8] text-white/70">{block.body}</p>}

          <ul className="mt-16 flex flex-col">
            {block.regions.map((r, i) => (
              <motion.li
                key={r.id}
                className="border-t border-white/15 py-8"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.5 }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              >
                <div className="flex items-baseline justify-between gap-6">
                  <motion.h3
                    className="font-display text-[clamp(34px,3.8vw,60px)] font-light uppercase leading-none"
                    variants={{ hidden: { opacity: 0, x: -30 }, show: { opacity: 1, x: 0 } }}
                    transition={{ duration: 0.9, ease: EASE }}
                  >
                    {r.region}
                  </motion.h3>
                  <span className="text-overline tracking-[0.2em] text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                  {r.cities.map((c, j) => (
                    <motion.span
                      key={c}
                      className="font-display text-[clamp(18px,1.6vw,24px)] italic text-primary-100"
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.6, ease: EASE }}
                    >
                      {c}
                      {j < r.cities.length - 1 && <span className="ml-3 not-italic text-white/25">·</span>}
                    </motion.span>
                  ))}
                </p>
              </motion.li>
            ))}
          </ul>

          {block.notes && block.notes.length > 0 && (
            <ol className="mt-20 grid gap-10 border-t border-white/15 pt-12">
              {block.notes.map((n, i) => (
                <motion.li
                  key={n.id}
                  className="grid grid-cols-[48px_1fr] gap-4"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <span className="font-display text-[34px] font-light leading-none text-primary-200">{i + 1}</span>
                  <div>
                    <h4 className="text-overline uppercase tracking-[0.22em] text-white">{n.title}</h4>
                    <p className="mt-3 max-w-[46ch] text-body-md leading-[1.8] text-white/65">{n.body}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          )}

          {block.cta && (
            <div className="mt-16">
              <GlassCta link={block.cta} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
