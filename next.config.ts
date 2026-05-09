import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@google/adk', '@google/genai', 'pdf-parse', '@napi-rs/canvas'],
};

export default nextConfig;
