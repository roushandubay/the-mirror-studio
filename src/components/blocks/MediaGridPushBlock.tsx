"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import GlassPanel from "@/components/ui/GlassPanel";
import RollLabel from "@/components/ui/RollLabel";
import { blockStyle } from "@/lib/blocks/style";
import { filterStyle, hasShade, shadeStyle } from "@/lib/blocks/media";
import { useIsMobile } from "@/lib/useViewport";
import type { MediaGridPushBlock as Data, MediaRef } from "@/lib/blocks/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Gallery grid.
 *
 * Items are dealt round-robin into columns, and each column drifts vertically
 * against the scroll in the OPPOSITE direction to its neighbour. That opposing
 * drift is what gives the grid depth — a single uniform parallax just looks
 * like the whole block is sliding.
 *
 * Desktop uses five columns (the reference layout); phones drop to two, which
 * is why the opposing drift matters most there: two tall columns travelling
 * against each other reads as motion even in a narrow viewport.
 */
export default function MediaGridPushBlock({ block }: { block: Data }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const m = block.motion ?? {};
  const colsDesktop = m.columns ?? 5;
  const colsMobile = m.columnsMobile ?? 2;
  const drift = m.drift ?? 120;
  const rise = m.rise ?? 40;
  const stagger = m.stagger ?? 0.07;
  // Match the source footage (9:16). A mismatched box makes object-cover crop
  // and scale the photo up, which looks like an unwanted zoom.
  const aspect = m.aspect ?? "9 / 16";

  const isMobile = useIsMobile();
  const cols = isMobile === null ? colsDesktop : isMobile ? colsMobile : colsDesktop;

  // Viewport filtering is a client-only refinement: the server and the first
  // client render both show everything, so there is nothing to mismatch.
  const vp = isMobile === null ? null : isMobile ? "mobile" : "desktop";
  const visible = vp
    ? block.items.filter((i) => !i.showOn || i.showOn === "both" || i.showOn === vp)
    : block.items;

  // Deal round-robin so adjacent images never end up stacked in one column
  const buckets: MediaRef[][] = Array.from({ length: cols }, () => []);
  visible.forEach((item, i) => buckets[i % cols].push(item));

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-canvas py-24 lg:py-32"
      style={blockStyle(block.style)}
    >
      <div
        className="mx-auto grid w-full max-w-[1600px] gap-3 px-3 lg:gap-6 lg:px-6"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {buckets.map((bucket, c) => (
          <GridColumn
            key={c}
            items={bucket}
            index={c}
            total={cols}
            progress={scrollYProgress}
            drift={drift}
            rise={rise}
            stagger={stagger}
            aspect={aspect}
            isMobile={!!isMobile}
          />
        ))}
      </div>

      {block.cta && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Link href={block.cta.href} className="pointer-events-auto">
            <GlassPanel tone="dark" className="h-14 whitespace-nowrap px-8 text-primary-900">
              <RollLabel>
                <span className="text-body-sm uppercase tracking-[0.16em]">
                  {block.cta.label}
                </span>
              </RollLabel>
            </GlassPanel>
          </Link>
        </div>
      )}
    </section>
  );
}

function GridColumn({
  items,
  index,
  total,
  progress,
  drift,
  rise,
  stagger,
  aspect,
  isMobile,
}: {
  items: MediaRef[];
  index: number;
  total: number;
  progress: MotionValue<number>;
  drift: number;
  rise: number;
  stagger: number;
  aspect: string;
  isMobile: boolean;
}) {
  const reduced = useReducedMotion();
  // Alternate direction, and taper the outer columns slightly so the middle of
  // the grid travels furthest
  const dir = index % 2 === 0 ? 1 : -1;
  // Taper across the COLUMN COUNT, so the middle columns travel furthest
  const amount = drift * (0.65 + 0.35 * Math.sin(((index + 1) / (total + 1)) * Math.PI));
  const y = useTransform(progress, [0, 1], [dir * amount, -dir * amount]);

  return (
    <motion.div
      className="flex flex-col gap-3 lg:gap-6"
      style={reduced ? undefined : { y }}
    >
      {items.map((item, i) => (
        <motion.figure
          key={item.src + i}
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: item.aspect ?? aspect }}
          initial={{ opacity: 0, y: rise }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, delay: i * stagger, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0"
            whileHover={reduced ? undefined : { scale: 1.03 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <Image
              src={isMobile && item.srcMobile ? item.srcMobile : item.src}
              alt={item.alt ?? ""}
              fill
              sizes="(max-width: 1024px) 48vw, 19vw"
              className={item.fit === "contain" ? "object-contain" : "object-cover"}
              style={{ objectPosition: item.focal ?? "50% 50%", ...filterStyle(item.adjust) }}
            />
          </motion.div>
          {hasShade(item.adjust) && (
            <div aria-hidden className="absolute inset-0" style={shadeStyle(item.adjust)} />
          )}
        </motion.figure>
      ))}
    </motion.div>
  );
}
