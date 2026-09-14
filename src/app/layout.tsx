import type { Metadata } from "next";
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { homePage } from "@/content/pages/home";
import { SITE } from "@/content/site";
import "./globals.css";

// Figma specifies Open Sans across the UI type ramp.
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

// Display face for the cinematic homepage. The italic is loaded deliberately —
// the whole design device is CAPS mixed with italic lowercase in one line.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Site-wide defaults; each page overrides title and description from its PageDoc
export const metadata: Metadata = {
  title: homePage.title,
  description: homePage.description,
  applicationName: SITE.name,
  openGraph: {
    title: homePage.title,
    description: homePage.description,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} ${cormorant.variable}`}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
