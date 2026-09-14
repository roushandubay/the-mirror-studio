"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import DisplayLine from "@/components/ui/DisplayLine";
import { blockStyle } from "@/lib/blocks/style";
import type { FaqBlock as Data } from "@/lib/blocks/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Questions as a hairline accordion. One answer open at a time; the answer's
 * height animates from its measured size, and the plus mark rotates into a
 * cross. Lenis re-measures the page on its own as the content resizes.
 */
export default function FaqBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<string | null>(block.items[0]?.id ?? null);
  const uid = useId();

  return (
    <section
      id={block.id}
      className="w-full bg-canvas px-6 py-24 text-primary-900 lg:px-16 lg:py-36"
      style={blockStyle(block.style)}
    >
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1fr_1.5fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          {block.eyebrow && (
            <p className="mb-5 text-overline uppercase tracking-[0.28em] text-primary">{block.eyebrow}</p>
          )}
          {block.heading && (
            <DisplayLine text={block.heading} align="left" className="text-d3 font-light leading-[1]" />
          )}
        </div>

        <ul className="border-b border-primary-900/15">
          {block.items.map((item) => {
            const isOpen = open === item.id;
            const panelId = `${uid}-${item.id}`;
            return (
              <li key={item.id} className="border-t border-primary-900/15">
                <button
                  type="button"
                  className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                >
                  <span className="font-display text-[clamp(22px,2vw,30px)] leading-[1.2] transition-colors duration-500 group-hover:text-primary">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="relative h-4 w-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: isOpen ? "rotate(135deg)" : "rotate(0deg)" }}
                  >
                    <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
                    <span className="absolute left-1/2 top-0 h-full w-px bg-current" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.55, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[62ch] pb-8 text-body-md leading-[1.9] text-ink/70">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
