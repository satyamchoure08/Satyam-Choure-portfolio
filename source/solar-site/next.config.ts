import type { NextConfig } from "next";

// Built as plain static files for the portfolio on GitHub Pages:
// https://satyamchoure08.github.io/Satyam-Choure-portfolio/samples/solar/
// The build output (out/) is copied to samples/solar/ in the portfolio root.
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Satyam-Choure-portfolio/samples/solar",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
