import type { NextConfig } from "next";

// Validate env vars at build time
import "./src/env";

const nextConfig: NextConfig = {
  // Recommended: output standalone for Docker deployments
  // output: "standalone",
};

export default nextConfig;
