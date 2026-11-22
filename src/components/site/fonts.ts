import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";

// Archivo for display, set wide through its width axis, and Instrument Sans
// for reading. Archivo ships with the site (its Latin subset, both axes, under
// the SIL Open Font License in fonts/); Instrument Sans is self-hosted by
// next/font. Neither asks Google for anything from the visitor's browser.
export const archivo = localFont({
  src: "./fonts/archivo-latin-wdth-wght.woff2",
  weight: "100 900",
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});
