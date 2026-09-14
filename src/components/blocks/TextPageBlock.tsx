"use client";

import { motion } from "motion/react";
import { blockStyle } from "@/lib/blocks/style";
import type { TextPageBlock as Data } from "@/lib/blocks/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Long-form policy text: a sticky contents list on the left (anchor links, which
 * Lenis animates) and a narrow, well-leaded reading column on the right.
 */
export default function TextPageBlock({ block }: { block: Data }) {
  return (
    <section
      id={block.id}
      className="w-full bg-canvas px-6 pb-28 pt-36 text-primary-900 lg:px-16 lg:pb-40 lg:pt-44"
      style={blockStyle(block.style)}
    >
      <div className="mx-auto max-w-[1200px]">
        <motion.h1
          className="font-display text-d2 font-light uppercase leading-[0.96]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1, ease: EASE }}
        >
          {block.heading}
        </motion.h1>
        {block.updated && (
          <p className="mt-6 text-overline uppercase tracking-[0.22em] text-muted">{block.updated}</p>
        )}

        <div className="mt-16 grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-20">
          <nav aria-label="Contents" className="lg:sticky lg:top-32 lg:self-start">
            <ol className="flex flex-col gap-2 border-l border-primary-900/15 pl-5">
              {block.sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-body-sm text-ink/60 transition-colors duration-300 hover:text-primary"
                  >
                    {String(i + 1).padStart(2, "0")} — {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-[68ch]">
            {block.sections.map((s) => (
              <motion.article
                key={s.id}
                id={s.id}
                className="mb-14 scroll-mt-32"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <h2 className="font-display text-[30px] leading-[1.2]">{s.heading}</h2>
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="mt-4 text-body-md leading-[1.9] text-ink/75">
                    {p}
                  </p>
                ))}
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
