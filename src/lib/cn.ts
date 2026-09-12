import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's stock scales. Our type ramp is defined
 * in @theme (globals.css) as `--text-d1`, `--text-h3`, `--text-body-md` and so
 * on, which tailwind-merge cannot see — it classifies `text-d2` as a *colour*
 * and therefore drops it whenever a real colour like `text-primary-900` appears
 * later in the same cn() call. The result is display headings silently
 * collapsing to the inherited font size.
 *
 * Registering the sizes under the `font-size` group fixes that: size and colour
 * are now separate groups and both survive.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "d1",
            "d2",
            "d3",
            "d4",
            "d5",
            "h1",
            "h3",
            "h4",
            "h5",
            "h6",
            "body-xl",
            "body-lg",
            "body-md",
            "body-sm",
            "body-xs",
            "overline",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
