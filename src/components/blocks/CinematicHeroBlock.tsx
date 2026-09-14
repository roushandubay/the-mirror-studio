"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import DisplayLine from "@/components/ui/DisplayLine";
import { blockStyle } from "@/lib/blocks/style";
import { filterStyle, hasShade, shadeStyle } from "@/lib/blocks/media";
import type { CinematicHeroBlock as Data } from "@/lib/blocks/types";

const EASE = [0.22, 1, 0.36, 1] as const;
const MOBILE = "(max-width: 767px)";

/**
 * Full-frame opening: video fills the viewport and the only chrome is two
 * mirror-glass pills and the studio's mark. No header bar — navigation lives
 * behind the MENU pill.
 *
 * Smoothness comes from three things: the correct cut is chosen at runtime
 * (never download the 1080p landscape file to a phone), the poster holds the
 * frame until the decoder is genuinely ready, and the video only crossfades in
 * on `canplaythrough` — so the first thing a visitor sees is never a stutter.
 */
export default function CinematicHeroBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const src = isMobile === null ? undefined : (isMobile && block.videoMobile) || block.video;
  const poster = (isMobile && block.imageMobile) || block.image;
  // Grading: the video uses its own group when given, otherwise the poster's
  const videoAdjust = block.videoAdjust ?? poster.adjust;

  // Swapping cuts resets readiness so the poster covers the changeover
  useEffect(() => {
    setReady(false);
    const v = videoRef.current;
    if (v && src) v.load();
  }, [src]);

  /**
   * The frame recedes without moving or scaling: a clip-path inset closes in
   * from the edges while the section scrolls away normally. Reading the
   * reference site, both insets ramp linearly at the same rate and settle at
   * p = 0.9, with the horizontal one lagging by 0.1 — which is why the frame
   * appears to close top-and-bottom first, then the sides.
   */
  const sh = block.shrinkOnScroll ?? {};
  const shrink = sh.enabled !== false;
  const vTo = sh.verticalTo ?? 13.5;
  const hTo = sh.horizontalTo ?? 12;
  const lag = sh.horizontalLag ?? 0.1;
  const completeAt = sh.completeAt ?? 0.9;

  const vInset = useTransform(scrollYProgress, [0, completeAt], [0, vTo]);
  const hInset = useTransform(scrollYProgress, [lag, completeAt], [0, hTo]);
  const radius = useTransform(scrollYProgress, [0, completeAt], [0, sh.radiusTo ?? 0]);
  const clipPath = useMotionTemplate`inset(${vInset}% ${hInset}% ${vInset}% ${hInset}% round ${radius}px)`;

  const dim = useTransform(scrollYProgress, [0, 1], [block.overlay ?? 0.4, sh.dimTo ?? 0.85]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden bg-primary-900"
      style={blockStyle(block.style)}
    >
      <motion.div className="absolute inset-0" style={reduced || !shrink ? undefined : { clipPath }}>
        {/* poster underneath — paints immediately, carries LCP */}
        <Image
          src={poster.src}
          alt={poster.alt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: poster.focal ?? "50% 50%", ...filterStyle(poster.adjust) }}
        />

        {src && !reduced && (
          <motion.video
            ref={videoRef}
            key={src}
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            poster={poster.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            // Only reveal once the browser says it can run it through without
            // buffering; anything earlier shows a hitch on the first loop.
            onCanPlayThrough={() => setReady(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            style={filterStyle(videoAdjust)}
          />
        )}

        {/* per-asset darkness / colour wash, kept off the pixels so highlights survive */}
        {hasShade(videoAdjust) && (
          <div aria-hidden className="absolute inset-0" style={shadeStyle(videoAdjust)} />
        )}
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute inset-0 bg-primary-900"
        style={reduced ? { opacity: block.overlay ?? 0.4 } : { opacity: dim }}
      />
      {/* scrims so the glass chrome stays legible over any frame */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/35 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/35 to-transparent"
      />

      {/* The fixed header used to live here; it is now the site-wide
          SiteHeader, rendered once per page. */}

      {/* centred identity */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-white">
        {block.wordmarkImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.35, duration: 1.2, ease: EASE }}
            className="mb-7"
          >
            <Image
              src={block.wordmarkImage.src}
              alt={block.wordmarkImage.alt ?? block.wordmark ?? "Logo"}
              width={132}
              height={132}
              priority
              className="h-[84px] w-[84px] rounded-full object-cover shadow-[0_10px_40px_-12px_rgba(0,0,0,0.65)] lg:h-[124px] lg:w-[124px]"
            />
          </motion.div>
        ) : (
          block.wordmark && (
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, letterSpacing: "0.32em" }}
              transition={{ delay: 0.35, duration: 1.4, ease: EASE }}
              className="mb-7 font-display text-d5 uppercase"
            >
              {block.wordmark}
            </motion.p>
          )
        )}

        <DisplayLine
          as="h1"
          text={block.tagline}
          inView={false}
          delay={0.7}
          stagger={0.05}
          duration={1.05}
          className="max-w-[20ch] text-d4 font-light leading-[1.12] drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
        />
      </div>

    </section>
  );
}
