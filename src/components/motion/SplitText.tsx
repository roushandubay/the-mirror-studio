"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type SplitTextProps = {
  text: string;
  /** split granularity */
  by?: "words" | "chars";
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  duration?: number;
  delay?: number;
  /** animate on scroll-into-view instead of on mount */
  inView?: boolean;
};

/**
 * Headline reveal: each word (or character) rises out from behind a clipping
 * mask. The mask is the wrapping <span> with overflow hidden — that's what
 * gives the "printed from below" feel rather than a plain fade.
 */
export default function SplitText({
  text,
  by = "words",
  as = "span",
  className,
  style,
  stagger = 0.055,
  duration = 0.85,
  delay = 0,
  inView = true,
}: SplitTextProps) {
  const reduced = useReducedMotion();
  const Tag = as;

  if (reduced) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    );
  }

  const tokens = by === "chars" ? Array.from(text) : text.split(/(\s+)/);
  const M = motion[as] as typeof motion.span;
  const activation = inView
    ? { whileInView: "show" as const, viewport: { once: true, amount: 0.5 } }
    : { animate: "show" as const };

  return (
    <M
      className={className}
      style={style}
      initial="hidden"
      {...activation}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {tokens.map((token, i) => {
        // Preserve whitespace runs without animating them
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        return (
          <span
            key={i}
            aria-hidden
            style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
          >
            <motion.span
              style={{ display: "inline-block", willChange: "transform" }}
              variants={{
                hidden: { y: "110%", opacity: 0 },
                show: { y: "0%", opacity: 1, transition: { duration, ease: EASE } },
              }}
            >
              {token}
            </motion.span>
          </span>
        );
      })}
    </M>
  );
}
