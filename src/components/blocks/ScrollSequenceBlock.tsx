"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import DisplayLine from "@/components/ui/DisplayLine";
import { blockStyle, resolveColor } from "@/lib/blocks/style";
import type { ScrollSequenceBlock as Data, SequenceStage } from "@/lib/blocks/types";

// Three.js is heavy and client-only — keep it out of the server bundle entirely.
const LipstickModel = dynamic(() => import("@/components/three/LipstickModel"), { ssr: false });

/**
 * Pinned scroll-scrub. The section reserves several viewports of scroll; the
 * stage inside stays fixed while the media transforms and headline stages
 * cross-fade through.
 *
 * Where the reference site scrubs a pre-rendered image sequence of a sculpture,
 * this drives a real 3D model — the studio's own lipstick — so it reflects the
 * scene properly and costs one 155KB file instead of 150 frames.
 */
export default function ScrollSequenceBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const length = block.scrollLength ?? 4;
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [block.scaleFrom ?? 0.32, block.scaleTo ?? 1.35],
  );
  const mediaOpacity = useTransform(scrollYProgress, [0, 0.06, 0.88, 1], [0, 1, 1, 0]);
  // A second, slower fall-off on the model itself so it recedes rather than
  // simply switching off at the end of the pin
  const modelOpacity = useTransform(scrollYProgress, [0, 0.04, 0.72, 1], [0, 1, 1, 0.15]);

  const usesModel = block.model === "lipstick";
  const glass = block.glassOverlay ?? {};
  const glassOn = glass.enabled !== false;
  const tint = glass.tint ?? 0.55;
  const blur = glass.blur ?? 16;

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{
        height: `${length * 100}svh`,
        background: resolveColor(block.background) ?? "var(--color-canvas)",
        ...blockStyle(block.style),
      }}
    >
      <div className="pin-stage flex items-center justify-center">
        {/* the media, scrubbed from thumbnail to full bleed */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          // The model carries its own fade; stacking this one on top as well
          // left it barely visible behind the glass.
          style={reduced || usesModel ? undefined : { opacity: mediaOpacity }}
        >
          {usesModel ? (
            <motion.div
              className="h-full w-full"
              style={reduced || block.fadeOut === false ? undefined : { opacity: modelOpacity }}
            >
              <LipstickModel progress={scrollYProgress} />
              {/* poster beneath, for reduced-motion and WebGL failures */}
              {reduced && (
                <Image
                  src={block.image.src}
                  alt={block.image.alt ?? ""}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              className="relative aspect-[3/4] h-[78svh] max-w-[92vw] overflow-hidden"
              style={reduced ? undefined : { scale }}
            >
              <Image
                src={block.image.src}
                alt={block.image.alt ?? ""}
                fill
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: block.image.focal ?? "50% 50%" }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* dark frosted glass over the scene — backdrop-filter really blurs the
            WebGL canvas behind it, so the model reads as sitting behind glass */}
        {glassOn && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{
              backdropFilter: `blur(${blur}px) saturate(115%)`,
              WebkitBackdropFilter: `blur(${blur}px) saturate(115%)`,
              background: `radial-gradient(120% 90% at 50% 40%, rgba(20,1,10,${tint * 0.7}), rgba(20,1,10,${tint}) 70%, rgba(20,1,10,${Math.min(1, tint + 0.18)}) 100%)`,
            }}
          />
        )}

        {/* headline stages */}
        <div className="pointer-events-none relative z-10 flex h-full w-full items-center justify-center px-6">
          {block.stages.map((stage) => (
            <Stage key={stage.id} stage={stage} progress={scrollYProgress} reduced={!!reduced} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stage({
  stage,
  progress,
  reduced,
}: {
  stage: SequenceStage;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduced: boolean;
}) {
  // Each stage owns a window of the scrub and fades through it
  const w = 0.16;
  const opacity = useTransform(
    progress,
    [stage.at - w, stage.at - w * 0.4, stage.at + w * 0.4, stage.at + w],
    [0, 1, 1, 0],
  );
  const y = useTransform(progress, [stage.at - w, stage.at + w], [40, -40]);

  return (
    <motion.div
      className="absolute inset-x-0 flex flex-col items-center gap-5 px-6 text-center"
      style={reduced ? undefined : { opacity, y }}
    >
      <DisplayLine
        text={stage.heading}
        inView={false}
        className="text-d2 font-light leading-[1.02] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
      />
      {stage.body && (
        // Sits over polished chrome, so it needs full contrast and a soft
        // plate behind it rather than the usual muted grey
        <p className="max-w-[44ch] text-body-md text-white/80">{stage.body}</p>
      )}
    </motion.div>
  );
}
