"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import type { ProductItem } from "@/lib/blocks/types";

/**
 * Figma "product card" (288x560): 384px image, then a 136px text well with
 * 16px gutters and a 24px bottom pad. Title/description are height-locked to
 * two lines each so a grid of cards always aligns.
 */
export default function ProductCard({
  item,
  className,
}: {
  item: ProductItem;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex h-full w-full flex-col gap-4 border border-line-2 bg-white pb-6",
        "transition-shadow duration-500 hover:shadow-[0_18px_50px_-24px_rgba(161,5,80,0.45)]",
        className,
      )}
    >
      <div className="relative h-96 w-full shrink-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          whileHover={reduced ? undefined : { scale: 1.06 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={item.image.src}
            alt={item.image.alt ?? item.title}
            fill
            sizes="(max-width: 768px) 80vw, 288px"
            className="object-cover"
            style={{ objectPosition: item.image.focal ?? "50% 50%" }}
          />
        </motion.div>

        {item.badge && (
          <span className="absolute left-0 top-4 bg-primary px-3 py-1 text-body-xs uppercase tracking-[0.8px] text-white">
            {item.badge}
          </span>
        )}
      </div>

      <div className="flex w-full flex-col justify-center gap-2 px-4 capitalize">
        <h3 className="line-clamp-2 min-h-11 text-h6 font-bold text-primary">{item.title}</h3>
        {item.description && (
          <p className="line-clamp-2 min-h-11 text-body-xs text-ink">{item.description}</p>
        )}
        {item.price && <p className="text-body-lg text-ink">{item.price}</p>}
      </div>
    </Link>
  );
}
