import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site (confirmed by `next build` already prerendering
  // both routes) -- exports plain HTML/CSS/JS to `out/` for hosting on
  // Amplify Hosting's static-deploy path (no Node server needed).
  output: "export",
};

export default nextConfig;
