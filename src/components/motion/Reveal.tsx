"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { CSSProperties, ElementType, ReactNode, Ref } from "react";
import type { AnimationName, BlockAnimation } from "@/lib/blocks/types";

const EASE = [0.22, 1, 0.36, 1] as const;

function variantsFor(name: AnimationName, distance = 28): Variants {
  switch (name) {
    case "fade":
      return { hidden: { opacity: 0 }, show: { opacity: 1 } };
    case "scale-in":
      return { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1 } };
    case "mask-wipe":
      // NOTE: this clips the element to zero area while hidden. Any next/image
      // inside a mask-wipe reveal must set loading="eager" — the browser never
      // queues a lazy image that is fully clipped, and does not re-check when
      // the mask opens.
      return {
        hidden: { clipPath: "inset(0 0 100% 0)" },
        show: { clipPath: "inset(0 0 0% 0)" },
      };
    case "rise":
    default:
      return { hidden: { opacity: 0, y: distance }, show: { opacity: 1, y: 0 } };
  }
}

type Tag = "div" | "section" | "li" | "article" | "span" | "ul";

type RevealProps = {
  children: ReactNode;
  as?: Tag;
  anim?: BlockAnimation;
  className?: string;
  style?: CSSProperties;
  /** When true this element animates nothing itself and instead staggers any
   *  <RevealItem> descendants. */
  group?: boolean;
  /** Forwarded to the underlying DOM node — needed when the caller has to
   *  measure or scroll this element (e.g. a carousel track). The element type
   *  varies with `as`, so this stays loose on purpose. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerRef?: Ref<any>;
};

/** Fires a block's entrance animation the first time it scrolls into view. */
export function Reveal({ children, as = "div", anim, className, style, group, innerRef }: RevealProps) {
  const reduced = useReducedMotion();
  const name = anim?.on ?? "rise";
  const M = motion[as] as typeof motion.div;

  if (reduced || (name === "none" && !group)) {
    const Plain = as as ElementType;
    return (
      <Plain ref={innerRef} className={className} style={style}>
        {children}
      </Plain>
    );
  }

  // mask-wipe hides the element by clipping it to zero area — which also makes
  // its own IntersectionObserver report it as not visible, so a standalone
  // mask-wipe could never trigger itself. Keep the outer element (the trigger)
  // unclipped and move the clip onto an inner wrapper.
  if (name === "mask-wipe" && !group) {
    const v = variantsFor(name);
    return (
      <M
        ref={innerRef}
        className={className}
        style={style}
        initial="hidden"
        whileInView="show"
        viewport={{ once: anim?.once ?? true, amount: anim?.amount ?? 0.2 }}
        variants={{ hidden: {}, show: {} }}
      >
        <motion.div
          variants={{
            hidden: v.hidden,
            show: {
              ...v.show,
              transition: {
                duration: anim?.duration ?? 0.8,
                delay: anim?.delay ?? 0,
                ease: EASE,
              },
            },
          }}
        >
          {children}
        </motion.div>
      </M>
    );
  }

  const variants: Variants = group
    ? {
        hidden: {},
        show: {
          transition: {
            staggerChildren: anim?.stagger ?? 0.09,
            delayChildren: anim?.delay ?? 0,
          },
        },
      }
    : (() => {
        const v = variantsFor(name);
        return {
          hidden: v.hidden,
          show: {
            ...v.show,
            transition: {
              duration: anim?.duration ?? 0.8,
              delay: anim?.delay ?? 0,
              ease: EASE,
            },
          },
        };
      })();

  return (
    <M
      ref={innerRef}
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: anim?.once ?? true, amount: anim?.amount ?? 0.2 }}
      variants={variants}
    >
      {children}
    </M>
  );
}

/** A child of a <Reveal group> — inherits the parent's stagger timing. */
export function RevealItem({
  children,
  as = "div",
  name = "rise",
  duration = 0.7,
  className,
  style,
}: {
  children: ReactNode;
  as?: Tag;
  name?: AnimationName;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  const M = motion[as] as typeof motion.div;

  if (reduced || name === "none") {
    const Plain = as as ElementType;
    return (
      <Plain className={className} style={style}>
        {children}
      </Plain>
    );
  }

  const v = variantsFor(name);
  return (
    <M
      className={className}
      style={style}
      variants={{
        hidden: v.hidden,
        show: { ...v.show, transition: { duration, ease: EASE } },
      }}
    >
      {children}
    </M>
  );
}
