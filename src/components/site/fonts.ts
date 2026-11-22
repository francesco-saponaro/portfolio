import localFont from "next/font/local";

// Archivo for display, set wide through its width axis, and Instrument Sans
// for reading. Archivo ships with the site (its Latin subset, both axes, under
// the SIL Open Font License in fonts/), and so does Instrument Sans (its Latin
// subset, weight axis). Nothing is fetched from Google, at build or in the browser.
export const archivo = localFont({
  src: "./fonts/archivo-latin-wdth-wght.woff2",
  weight: "100 900",
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const instrument = localFont({
  src: "./fonts/instrument-sans-latin-wght.woff2",
  weight: "400 700",
  variable: "--font-instrument",
  display: "swap",
});
