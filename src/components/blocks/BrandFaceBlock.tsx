"use client";

import Image from "next/image";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import DisplayLine from "@/components/ui/DisplayLine";
import GlassCta from "@/components/ui/GlassCta";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { blockStyle } from "@/lib/blocks/style";
import { filterStyle } from "@/lib/blocks/media";
import type { BrandFaceBlock as Data } from "@/lib/blocks/types";

const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;
/** the studio's own mirror is an arch — the portrait frame borrows its shape */
const ARCH = "999px 999px 0 0";

/**
 * Janvi Agarwal, as the face of the brand.
 *
 * Her name runs enormous across the section and slides against the scroll;
 * her portrait stands in front of it inside an arch — the shape of the mirror
 * in her studio — and behind the portrait a larger arch holds a pool of liquid
 * chrome, so she appears to be standing in front of a living mirror.
 *
 * The portrait tilts toward the pointer in real perspective with a specular
 * sweep across the glass, and a second photograph of her at work rises past it
 * faster than the scroll. Stats count up the first time they are seen.
 */
export default function BrandFaceBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const nameX = useTransform(scrollYProgress, [0, 1], ["8%", "-22%"]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const innerScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.18, 1.04, 1.12]);
  const secondaryY = useTransform(scrollYProgress, [0, 1], [180, -160]);
  const haloRotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);

  // pointer tilt, in real perspective
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 18 });
  const sry = useSpring(ry, { stiffness: 120, damping: 18 });
  const glareX = useMotionValue(50);
  const glare = useMotionTemplate`linear-gradient(115deg, rgba(255,255,255,0) calc(${glareX}% - 30%), rgba(255,255,255,0.28) ${glareX}%, rgba(255,255,255,0) calc(${glareX}% + 30%))`;

  return (
    <section
      ref={ref}
      id={block.id}
      className="relative w-full overflow-hidden bg-canvas py-28 text-primary-900 lg:py-40"
      style={blockStyle(block.style)}
    >
      {block.eyebrow && (
        <p className="relative z-20 mb-6 text-center text-overline uppercase tracking-[0.3em] text-primary">
          {block.eyebrow}
        </p>
      )}

      {/* the name, running past both edges behind the portrait */}
      <motion.p
        aria-hidden
        className="liquid-text liquid-text-dark pointer-events-none relative z-0 whitespace-nowrap font-display text-[clamp(72px,17vw,280px)] font-light uppercase leading-[0.85]"
        style={reduced ? undefined : { x: nameX }}
      >
        {block.name} — {block.name}
      </motion.p>

      <div className="relative z-10 mx-auto -mt-[clamp(40px,8vw,140px)] grid max-w-[1400px] items-center gap-14 px-6 lg:grid-cols-[1fr_minmax(320px,440px)_1fr] lg:gap-16 lg:px-16">
        {/* left: the statement — pushed below the name so only the portrait overlaps it */}
        <div className="order-2 lg:order-1 lg:pt-[clamp(80px,10vw,180px)]">
          <DisplayLine
            text={block.statement}
            align="left"
            className="text-d4 font-light leading-[1.06] text-primary-900"
          />
          {block.role && (
            <p className="mt-6 text-overline uppercase tracking-[0.24em] text-muted">{block.role}</p>
          )}
          {block.signature && (
            <motion.p
              className="mt-10 font-display text-[clamp(34px,3.4vw,52px)] italic leading-none text-primary"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 1.8, ease: EASE }}
            >
              {block.signature}
            </motion.p>
          )}
        </div>

        {/* centre: the portrait in an arch, in front of a liquid-chrome arch */}
        <motion.div
          className="relative order-1 mx-auto w-full max-w-[440px] lg:order-2"
          style={reduced ? undefined : { y: portraitY }}
        >
          <motion.div
            aria-hidden
            className="absolute -inset-x-[14%] -top-[9%] bottom-[6%] overflow-hidden bg-primary-900"
            style={{ borderRadius: ARCH, ...(reduced ? {} : { rotate: haloRotate }) }}
          >
            {block.scene && block.scene !== "none" && <SceneCanvas scene={block.scene} progress={scrollYProgress} />}
          </motion.div>

          {/* The in-view trigger lives on this UNCLIPPED parent: a fully clipped
              element never reports itself as visible (see README, bug 2). */}
          <motion.div
            style={{ perspective: 1100 }}
            initial={reduced ? "show" : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.div
              className="relative aspect-[3/4.4] w-full overflow-hidden shadow-[0_40px_80px_-30px_rgba(20,1,10,0.6)]"
              style={{
                borderRadius: ARCH,
                ...(reduced ? {} : { rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" as const }),
              }}
              onPointerMove={(e) => {
                if (reduced) return;
                const r = e.currentTarget.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                ry.set((px - 0.5) * 14);
                rx.set(-(py - 0.5) * 10);
                glareX.set(px * 100);
              }}
              onPointerLeave={() => {
                rx.set(0);
                ry.set(0);
                glareX.set(50);
              }}
              variants={{
                hidden: { clipPath: "inset(100% 0% 0% 0%)" },
                show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.4, ease: EASE } },
              }}
            >
              <motion.div className="absolute inset-0" style={reduced ? undefined : { scale: innerScale }}>
                <Image
                  src={block.portrait.src}
                  alt={block.portrait.alt ?? block.name}
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 90vw, 440px"
                  className="object-cover"
                  style={{ objectPosition: block.portrait.focal ?? "50% 30%", ...filterStyle(block.portrait.adjust) }}
                />
              </motion.div>
              {!reduced && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                  style={{ backgroundImage: glare }}
                />
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[10px] border border-white/40"
                style={{ borderRadius: ARCH }}
              />
            </motion.div>
          </motion.div>

          {block.secondary && (
            <motion.div
              className="absolute -bottom-10 -right-6 hidden aspect-[3/4] w-[46%] overflow-hidden border-[6px] border-canvas shadow-[0_30px_60px_-24px_rgba(20,1,10,0.55)] sm:block lg:-right-24"
              style={reduced ? undefined : { y: secondaryY }}
            >
              <Image
                src={block.secondary.src}
                alt={block.secondary.alt ?? ""}
                fill
                loading="eager"
                sizes="220px"
                className="object-cover"
                style={{ objectPosition: block.secondary.focal ?? "50% 30%" }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* right: the story and the numbers */}
        <div className="order-3 lg:pt-[clamp(80px,10vw,180px)]">
          {block.body && (
            <Reveal group anim={{ stagger: 0.1 }}>
              {block.body.map((p, i) => (
                <RevealItem key={i}>
                  <p className="mb-5 text-body-md leading-[1.9] text-ink/75">{p}</p>
                </RevealItem>
              ))}
            </Reveal>
          )}

          {block.stats && block.stats.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-primary-900/15 pt-8">
              {block.stats.map((s) => (
                <div key={s.id}>
                  <dd className="font-display text-[clamp(40px,4vw,60px)] font-light leading-none text-primary-900">
                    <Counter to={s.value} />
                    {s.suffix && <span className="ml-1 text-[0.4em] italic text-primary">{s.suffix}</span>}
                  </dd>
                  <dt className="mt-2 text-overline uppercase tracking-[0.2em] text-muted">{s.label}</dt>
                </div>
              ))}
            </dl>
          )}

          {block.cta && (
            <div className="mt-12">
              <GlassCta link={block.cta} tone="dark" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 2,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString("en-IN")}
    </span>
  );
}
