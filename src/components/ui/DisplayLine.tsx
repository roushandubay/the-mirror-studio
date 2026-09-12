"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ElementType } from "react";
import { cn } from "@/lib/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The signature typographic device: a single line mixing uppercase roman with
 * italic lowercase, e.g. "Custom SCULPTURE of your WEDDING DRESS".
 *
 * Authoring convention — wrap the italic-lowercase words in underscores:
 *
 *   "Your most _important_ day"        -> YOUR MOST *important* DAY
 *   "so THAT YOU BECOME _art._"        -> SO THAT YOU BECOME *art.*
 *
 * Underscores are used rather than HTML so the client can type the emphasis
 * straight into a plain CMS text field.
 *
 * Each word rises out from behind its own clipping mask, staggered left to
 * right — the same rig the reference site uses (its display strings appear
 * twice in the DOM, once per split layer).
 */

type Token = { text: string; italic: boolean };

export function parseDisplay(input: string): Token[] {
  const out: Token[] = [];
  // Split on _..._ runs, keeping the delimiters so we can tag them
  for (const chunk of input.split(/(_[^_]+_)/g)) {
    if (!chunk) continue;
    const italic = chunk.startsWith("_") && chunk.endsWith("_") && chunk.length > 2;
    const text = italic ? chunk.slice(1, -1) : chunk;
    for (const word of text.split(/(\s+)/)) {
      if (word === "") continue;
      out.push({ text: word, italic });
    }
  }
  return out;
}

/** Plain-text version of a display string, for aria-label and metadata. */
export function displayPlain(input: string) {
  return input.replace(/_/g, "");
}

/**
 * Same CAPS + italic-lowercase treatment, rendered statically. Used where the
 * text is persistent rather than revealed — e.g. the stepper's single caption
 * line, whose fragments only change brightness.
 */
export function DisplayStatic({
  text,
  className,
  style,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}) {
  return (
    <Tag className={cn(className)} style={style}>
      {parseDisplay(text).map((t, i) =>
        /^\s+$/.test(t.text) ? (
          <span key={i}> </span>
        ) : t.italic ? (
          <em key={i} className="italic lowercase">
            {t.text}
          </em>
        ) : (
          <span key={i} className="uppercase">
            {t.text}
          </span>
        ),
      )}
    </Tag>
  );
}

export default function DisplayLine({
  text,
  as = "h2",
  className,
  style,
  stagger = 0.045,
  duration = 0.95,
  delay = 0,
  inView = true,
  align = "center",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  duration?: number;
  delay?: number;
  /** false = animate on mount (hero), true = animate when scrolled into view */
  inView?: boolean;
  align?: "left" | "center" | "right";
}) {
  const reduced = useReducedMotion();
  const tokens = parseDisplay(text);
  const plain = displayPlain(text);
  const Tag = as;

  const base = cn(
    "font-display",
    align === "center" && "text-center",
    align === "right" && "text-right",
    className,
  );

  if (reduced) {
    return (
      <Tag className={base} style={style}>
        {tokens.map((t, i) =>
          t.italic ? (
            <em key={i} className="italic lowercase">
              {t.text}
            </em>
          ) : (
            <span key={i} className="uppercase">
              {t.text}
            </span>
          ),
        )}
      </Tag>
    );
  }

  const activation = inView
    ? { whileInView: "show" as const, viewport: { once: true, amount: 0.4 } }
    : { animate: "show" as const };

  return (
    <motion.div
      className={base}
      style={style}
      initial="hidden"
      {...activation}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={plain}
      role="heading"
      aria-level={as === "h1" ? 1 : as === "h3" ? 3 : 2}
    >
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token.text)) return <span key={i}> </span>;
        return (
          <span
            key={i}
            aria-hidden
            className="inline-block overflow-hidden align-top"
            // A touch of vertical breathing room so descenders and italic
            // swashes are not clipped by their own mask
            style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
          >
            <motion.span
              className={cn(
                "inline-block will-change-transform",
                token.italic ? "italic lowercase" : "uppercase",
              )}
              variants={{
                hidden: { y: "108%" },
                show: { y: "0%", transition: { duration, ease: EASE } },
              }}
            >
              {token.text}
            </motion.span>
          </span>
        );
      })}
    </motion.div>
  );
}
