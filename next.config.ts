import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/[slug]": ["./src/mirror/page.html"],
  },
};

export default nextConfig;
