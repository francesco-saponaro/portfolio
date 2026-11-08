import { Instrument_Sans, Unbounded } from "next/font/google";

// Zumbot's own display face (Unbounded, round and wide) with Zumbat's text
// face (Instrument Sans), self-hosted by next/font: no request to Google
// from the visitor's browser, so no cookie banner is needed for fonts.
export const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-unbounded",
  display: "swap",
});

export const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});
