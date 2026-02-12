import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__e2e__/target",
        destination: "/e2e-target",
      },
    ];
  },
};

export default nextConfig;
