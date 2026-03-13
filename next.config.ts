import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pelita-webtournament",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;