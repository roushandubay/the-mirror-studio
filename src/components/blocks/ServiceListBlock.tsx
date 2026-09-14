"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useVelocity,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import DisplayLine, { DisplayStatic } from "@/components/ui/DisplayLine";
import GlassPanel from "@/components/ui/GlassPanel";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { blockStyle } from "@/lib/blocks/style";
import { filterStyle } from "@/lib/blocks/media";
import { useIsMobile } from "@/lib/useViewport";
import type { ServiceItem, ServiceListBlock as Data } from "@/lib/blocks/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const bookHref = (item: ServiceItem) =>
  item.href ?? (item.bookValue ? `/book?service=${encodeURIComponent(item.bookValue)}` : "/book");

/**
 * Services as an editorial list.
 *
 * ROWS: each service is one hairline row set in the display face. Hovering a
 * row floats that service's photograph under the cursor; the photo trails on a
 * spring and leans into the direction of travel (its tilt is driven by the
 * pointer's velocity), then wipes to the next photo as you move between rows.
 * On touch screens, where there is no hover, the photograph sits in the row.
 *
 * CARDS: tall image cards for index pages.
 */
export default function ServiceListBlock({ block }: { block: Data }) {
  return (
    <section
      id={block.id}
      className="relative w-full bg-canvas px-6 py-24 text-primary-900 lg:px-16 lg:py-36"
      style={blockStyle(block.style)}
    >
      <div className="mx-auto max-w-[1400px]">
        {(block.eyebrow || block.heading || block.intro) && (
          <div className="mb-14 grid gap-8 lg:mb-20 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              {block.eyebrow && (
                <p className="mb-5 text-overline uppercase tracking-[0.28em] text-primary">{block.eyebrow}</p>
              )}
              {block.heading && (
                <DisplayLine
                  text={block.heading}
                  align="left"
                  className="text-d3 font-light leading-[1] text-primary-900"
                />
              )}
            </div>
            {block.intro && <p className="max-w-[46ch] text-body-md leading-[1.9] text-ink/70">{block.intro}</p>}
          </div>
        )}

        {block.layout === "cards" ? <Cards items={block.items} /> : <Rows items={block.items} />}
      </div>
    </section>
  );
}

function Rows({ items }: { items: ServiceItem[] }) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const listRef = useRef<HTMLUListElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 150, damping: 20, mass: 0.5 });
  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-1600, 1600], [-12, 12], { clamp: true });

  const hover = !reduced && isMobile === false;
  const current = hovered != null ? items[hovered] : null;

  return (
    <div className="relative">
      <ul
        ref={listRef}
        className="border-b border-primary-900/15"
        onPointerMove={(e) => {
          const r = listRef.current?.getBoundingClientRect();
          if (!r) return;
          x.set(e.clientX - r.left);
          y.set(e.clientY - r.top);
        }}
        onPointerLeave={() => setHovered(null)}
      >
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            className="group relative border-t border-primary-900/15"
            onPointerEnter={() => setHovered(i)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: Math.min(i, 4) * 0.06, ease: EASE }}
          >
            <Link
              href={bookHref(item)}
              className="grid items-baseline gap-x-8 gap-y-3 py-8 lg:grid-cols-[64px_1.1fr_1fr_auto] lg:py-10"
            >
              <span className="text-overline tracking-[0.2em] text-muted">{String(i + 1).padStart(2, "0")}</span>

              <span className="flex items-center gap-4">
                {!hover && item.image && (
                  <span className="relative block h-20 w-16 shrink-0 overflow-hidden">
                    <Image
                      src={item.image.src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                      style={{ objectPosition: item.image.focal ?? "50% 40%" }}
                    />
                  </span>
                )}
                <span className="font-display text-[clamp(30px,3.6vw,56px)] font-light uppercase leading-[1] transition-[letter-spacing,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:tracking-[0.03em] group-hover:text-primary">
                  {item.title}
                </span>
              </span>

              <span className="flex flex-col gap-3">
                {item.description && <span className="text-body-md leading-[1.8] text-ink/70">{item.description}</span>}
                {item.includes && item.includes.length > 0 && (
                  <span className="flex flex-wrap gap-1.5">
                    {item.includes.map((inc) => (
                      <span
                        key={inc}
                        className="border border-primary-900/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-ink/60"
                      >
                        {inc}
                      </span>
                    ))}
                  </span>
                )}
              </span>

              <span className="flex items-center gap-6 lg:flex-col lg:items-end lg:gap-2">
                {item.duration && (
                  <span className="text-overline uppercase tracking-[0.2em] text-muted">{item.duration}</span>
                )}
                {item.price && <span className="font-display text-[22px] text-primary-900">{item.price}</span>}
                <GlassPanel tone="dark" className="h-12 w-12 shrink-0">
                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.4}
                    className="transition-transform duration-500 group-hover:rotate-45"
                  />
                </GlassPanel>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      {/* the floating photograph */}
      {hover && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 h-[300px] w-[230px]"
          style={{ x: sx, y: sy, rotate, translateX: "-50%", translateY: "-50%" }}
        >
          <AnimatePresence>
            {current?.image && (
              <motion.div
                key={current.id}
                className="absolute inset-0 overflow-hidden shadow-[0_30px_60px_-20px_rgba(20,1,10,0.5)]"
                initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.1 }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.5, ease: EASE } }}
                transition={{ duration: 0.65, ease: EASE }}
              >
                <Image
                  src={current.image.src}
                  alt=""
                  fill
                  loading="eager"
                  sizes="230px"
                  className="object-cover"
                  style={{ objectPosition: current.image.focal ?? "50% 40%", ...filterStyle(current.image.adjust) }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function Cards({ items }: { items: ServiceItem[] }) {
  return (
    <Reveal group anim={{ stagger: 0.1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {items.map((item) => (
        <RevealItem key={item.id}>
          <Card item={item} />
        </RevealItem>
      ))}
    </Reveal>
  );
}

function Card({ item }: { item: ServiceItem }) {
  const reduced = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sry = useSpring(ry, { stiffness: 140, damping: 18 });

  return (
    <Link href={bookHref(item)} className="group block" style={{ perspective: 900 }}>
      <motion.div
        className="relative aspect-[3/4.2] overflow-hidden bg-primary-900"
        style={reduced ? undefined : { rotateX: srx, rotateY: sry }}
        onPointerMove={(e) => {
          if (reduced) return;
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
      >
        {item.image && (
          <Image
            src={item.image.src}
            alt={item.image.alt ?? item.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
            className="object-cover opacity-80 transition-[transform,opacity] duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:opacity-100"
            style={{ objectPosition: item.image.focal ?? "50% 40%" }}
          />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white">
          <DisplayStatic
            as="span"
            text={item.title}
            className="block font-display text-[clamp(26px,2.2vw,34px)] font-light leading-[1.05]"
          />
          {item.description && (
            <span className="max-h-0 overflow-hidden text-body-sm text-white/75 opacity-0 transition-all duration-700 group-hover:max-h-40 group-hover:opacity-100">
              {item.description}
            </span>
          )}
          <GlassPanel className="mt-2 h-10 w-fit px-5">
            <span className="flex items-center gap-2 text-overline uppercase tracking-[0.2em]">
              Explore <ArrowUpRight size={14} strokeWidth={1.5} />
            </span>
          </GlassPanel>
        </div>
      </motion.div>
    </Link>
  );
}
