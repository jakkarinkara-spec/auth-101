import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the root so Turbopack doesn't infer the parent folder and
    // create broken `auth-101/auth-101/node_modules` links in .next.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
