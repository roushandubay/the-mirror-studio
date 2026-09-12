import SplitText from "@/components/motion/SplitText";
import { cn } from "@/lib/cn";

/** The centred "Our Best Sellers" / "Products' Categories" H3 used throughout. */
export default function SectionHeading({
  children,
  className,
  align = "center",
}: {
  children: string;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <SplitText
      as="h2"
      text={children}
      by="words"
      className={cn(
        "text-h3 font-bold capitalize text-ink",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
    />
  );
}
