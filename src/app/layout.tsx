import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://portfolio-francesco-saponaro.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Francesco Saponaro · Full-stack developer",
  description:
    "Full-stack developer in Paris. Web and mobile products in TypeScript: React and Next.js on the front, Node.js and SQL on the back, Expo for mobile.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Francesco Saponaro · Full-stack developer",
    description: "Web and mobile products in TypeScript, end to end. Based in Paris.",
    siteName: "Francesco Saponaro",
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
