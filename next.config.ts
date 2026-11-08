import type { NextConfig } from "next";

// The site is static files: the one page is rendered to out/index.html at
// build time and the robot runs in the browser.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
