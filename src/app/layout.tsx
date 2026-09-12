import type { Metadata } from "next";
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { landingPage } from "@/content/landing";
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

export const metadata: Metadata = {
  title: landingPage.title,
  description: landingPage.description,
  openGraph: {
    title: landingPage.title,
    description: landingPage.description,
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
