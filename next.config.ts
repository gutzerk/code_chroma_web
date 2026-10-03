import type { NextConfig } from "next";

const basePath = "/code_chroma_web";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  basePath,
  assetPrefix: `${basePath}/`,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
