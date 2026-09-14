"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import DisplayLine from "@/components/ui/DisplayLine";
import GlassCta, { TextCta } from "@/components/ui/GlassCta";
import MediaFill from "@/components/ui/MediaFill";
import { blockStyle } from "@/lib/blocks/style";
import { cn } from "@/lib/cn";
import type { PageHeroBlock as Data } from "@/lib/blocks/types";

const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Inner-page opening.
 *
 * Object scenes (globe, particles, mirror) take the right of the frame with
 * the words on the left; surface scenes (liquid) and photographs fill the whole
 * frame with the words centred over them. On phones every scene sits behind
 * the text, dimmed.
 *
 * As the hero scrolls away the copy lifts and fades while the scene keeps
 * going underneath — its progress is fed the same scroll, so a globe turns and
 * dust re-forms as the visitor leaves.
 */
export default function PageHeroBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const scene = block.scene ?? "none";
  const split = scene === "globe" || scene === "particles" || scene === "mirror";

  const copyY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);

  // Particle words: the dust gathers into the first word as the page opens,
  // then scrolling carries it through the rest. State 0 is the loose cloud.
  const intro = useMotionValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    const c = animate(intro, 1, { duration: 2.8, delay: 0.5, ease: [0.45, 0, 0.2, 1] });
    return () => c.stop();
  }, [intro, reduced]);
  const wordCount = Math.max(1, block.sceneWords?.length ?? 2);
  const particleProgress = useTransform(
    [intro, scrollYProgress] as MotionValue<number>[],
    ([i, s]: number[]) => (i + Math.min(1, s * 1.6) * (wordCount - 1)) / wordCount,
  );

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-primary-900 text-white"
      style={{ minHeight: `${(block.height ?? 1) * 100}svh`, ...blockStyle(block.style) }}
    >
      {block.image && (
        <motion.div className="absolute inset-0" style={reduced ? undefined : { y: imageY, scale: imageScale }}>
          <MediaFill media={block.image} src={block.image.src} fit={block.image.fit} priority sizes="100vw" />
          <div aria-hidden className="absolute inset-0 bg-primary-900/55" />
        </motion.div>
      )}

      {/* the scene: right half for objects, full frame for surfaces */}
      {scene !== "none" && (
        <motion.div
          className={cn(
            "absolute",
            split ? "inset-0 opacity-20 lg:inset-y-0 lg:left-[44%] lg:right-0 lg:opacity-100" : "inset-0",
          )}
          style={reduced ? undefined : { scale: sceneScale }}
        >
          <SceneCanvas
            scene={scene}
            progress={scene === "particles" ? particleProgress : scrollYProgress}
            words={block.sceneWords}
            texture={block.sceneTexture}
            // the box is framed for a full viewport; in the half-frame it needs
            // a shorter stage or it crowds the facts row
            className={scene === "mirror" ? "mx-auto mt-[6svh] !h-[76svh]" : undefined}
          />
        </motion.div>
      )}

      {/* soft falloff so the copy side stays legible over any scene */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          split
            ? "bg-gradient-to-r from-primary-900 via-primary-900/70 to-transparent lg:via-primary-900/40"
            : "bg-[radial-gradient(90%_70%_at_50%_50%,rgba(20,1,10,0.15),rgba(20,1,10,0.7))]",
        )}
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />

      <motion.div
        className={cn(
          "relative z-10 mx-auto flex min-h-[inherit] w-full max-w-[1400px] flex-col justify-center px-6 pb-36 pt-32 lg:px-16",
          // split: pinned to the left edge and capped at 44vw, so on very wide
          // screens the centred well cannot push the copy under the scene
          split ? "items-start text-left lg:mx-0 lg:max-w-[44vw] lg:pr-0" : "items-center text-center",
        )}
        style={{ minHeight: `${(block.height ?? 1) * 100}svh`, ...(reduced ? {} : { y: copyY, opacity: copyOpacity }) }}
      >
        {block.eyebrow && (
          <motion.p
            className="mb-6 text-overline uppercase tracking-[0.28em] text-primary-100"
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.28em" }}
            transition={{ delay: 0.25, duration: 1.2, ease: EASE }}
          >
            {block.eyebrow}
          </motion.p>
        )}

        <DisplayLine
          as="h1"
          text={block.heading}
          inView={false}
          delay={0.35}
          align={split ? "left" : "center"}
          className={cn(
            "font-light leading-[0.98] text-white drop-shadow-[0_2px_30px_rgba(20,1,10,0.5)]",
            // split: sized to end before the scene, which starts at 44% of the viewport
            split ? "max-w-[13ch] text-[clamp(40px,5.8vw,104px)] lg:max-w-[40vw]" : "max-w-[16ch] text-d2",
          )}
        />

        {block.body && (
          <motion.p
            className={cn("mt-8 max-w-[46ch] text-body-lg text-white/75", split ? "lg:max-w-[38vw]" : "mx-auto")}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1, ease: EASE }}
          >
            {block.body}
          </motion.p>
        )}

        {(block.cta || block.secondaryCta) && (
          <motion.div
            className="mt-10 flex flex-wrap items-center gap-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1, ease: EASE }}
          >
            {block.cta && <GlassCta link={block.cta} />}
            {block.secondaryCta && <TextCta link={block.secondaryCta} />}
          </motion.div>
        )}
      </motion.div>

      {block.facts && block.facts.length > 0 && (
        <motion.dl
          className="absolute inset-x-0 bottom-0 z-10 mx-auto grid max-w-[1400px] grid-cols-2 border-t border-white/15 px-6 lg:grid-cols-4 lg:px-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
        >
          {block.facts.map((f) => (
            <div key={f.label} className="flex flex-col gap-1 py-5 pr-4">
              <dt className="text-overline uppercase tracking-[0.22em] text-white/50">{f.label}</dt>
              <dd className="font-display text-[clamp(18px,1.8vw,26px)] leading-tight text-white">{f.value}</dd>
            </div>
          ))}
        </motion.dl>
      )}
    </section>
  );
}
