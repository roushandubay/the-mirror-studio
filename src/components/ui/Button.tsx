"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import type { LinkRef } from "@/lib/blocks/types";

/**
 * Figma "Button" component: 48px tall, 16px horizontal padding, 2px border,
 * 16px regular capitalised label. The sweep fill on hover is ours.
 */
const VARIANTS = {
  solid: "border-2 border-primary bg-primary text-white",
  outline: "border-2 border-white text-white",
  ghost: "border-2 border-primary text-primary",
  link: "text-primary underline underline-offset-4",
} as const;

const SWEEP = {
  solid: "bg-primary-700",
  outline: "bg-white",
  ghost: "bg-primary",
  link: "",
} as const;

const SWEEP_TEXT = {
  solid: "group-hover:text-white",
  outline: "group-hover:text-primary-750",
  ghost: "group-hover:text-white",
  link: "",
} as const;

export default function Button({
  link,
  className,
  fullWidth,
}: {
  link: LinkRef;
  className?: string;
  fullWidth?: boolean;
}) {
  const reduced = useReducedMotion();
  const variant = link.variant ?? "outline";
  const isLink = variant === "link";

  return (
    <Link
      href={link.href}
      className={cn(
        "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden px-4 py-2",
        "text-body-md capitalize transition-colors duration-500",
        VARIANTS[variant],
        fullWidth && "w-full",
        className,
      )}
    >
      {!isLink && !reduced && (
        <motion.span
          aria-hidden
          className={cn("absolute inset-0 origin-bottom", SWEEP[variant])}
          initial={{ scaleY: 0 }}
          whileHover={{ scaleY: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <span className={cn("relative z-10 whitespace-nowrap transition-colors duration-500", SWEEP_TEXT[variant])}>
        {link.label}
      </span>
    </Link>
  );
}
