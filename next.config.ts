import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  basePath: "/code_chroma_web",
  assetPrefix: "/code_chroma_web/",

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
