"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import DisplayLine from "@/components/ui/DisplayLine";
import { blockStyle } from "@/lib/blocks/style";
import type { ContactBlock as Data } from "@/lib/blocks/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Contact: every channel set as one large hairline row, so the page itself is
 * the list of ways in. Beside it, the studio photograph in an arch with its
 * hours and a directions link.
 */
export default function ContactBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={ref}
      id={block.id}
      className="w-full bg-canvas px-6 pb-24 pt-32 text-primary-900 lg:px-16 lg:pb-36 lg:pt-44"
      style={blockStyle(block.style)}
    >
      <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
        <div>
          <DisplayLine
            as="h1"
            text={block.heading}
            inView={false}
            delay={0.3}
            align="left"
            className="text-d2 font-light leading-[0.96]"
          />
          {block.intro && <p className="mt-8 max-w-[46ch] text-body-lg text-ink/70">{block.intro}</p>}

          <ul className="mt-16 border-b border-primary-900/15">
            {block.channels.map((c, i) => {
              const external = c.href && /^https?:/.test(c.href);
              const content = (
                <>
                  <span className="text-overline uppercase tracking-[0.22em] text-muted">{c.label}</span>
                  <span className="flex items-center justify-between gap-4">
                    <span className="font-display text-[clamp(26px,3.2vw,48px)] font-light leading-[1.1] transition-colors duration-500 group-hover:text-primary">
                      {c.value}
                    </span>
                    {c.href && (
                      <ArrowUpRight
                        size={26}
                        strokeWidth={1.2}
                        className="shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    )}
                  </span>
                </>
              );
              return (
                <motion.li
                  key={c.id}
                  className="border-t border-primary-900/15"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.8, ease: EASE }}
                >
                  {c.href ? (
                    <a
                      href={c.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer noopener" : undefined}
                      className="group grid gap-2 py-7"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="grid gap-2 py-7">{content}</div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-10">
          {block.image && (
            <motion.div
              className="relative aspect-[3/4] w-full overflow-hidden"
              style={{ borderRadius: "999px 999px 0 0" }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1.2, ease: EASE }}
            >
              <motion.div className="absolute -inset-y-[10%] inset-x-0" style={reduced ? undefined : { y: imgY }}>
                <Image
                  src={block.image.src}
                  alt={block.image.alt ?? ""}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 520px"
                  className="object-cover"
                  style={{ objectPosition: block.image.focal ?? "50% 40%" }}
                />
              </motion.div>
            </motion.div>
          )}

          {block.hours && (
            <dl className="grid gap-3">
              {block.hours.map((h) => (
                <div key={h.id} className="flex justify-between gap-6 border-b border-primary-900/10 pb-3">
                  <dt className="text-body-sm text-ink/70">{h.days}</dt>
                  <dd className="text-body-sm text-primary-900">{h.time}</dd>
                </div>
              ))}
            </dl>
          )}

          {block.address && (
            <div>
              <p className="font-display text-[24px] leading-[1.3]">{block.address}</p>
              {block.mapHref && (
                <a
                  href={block.mapHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-flex items-center gap-2 text-overline uppercase tracking-[0.22em] text-primary"
                >
                  Get directions <ArrowUpRight size={14} strokeWidth={1.5} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
