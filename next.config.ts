import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Not using `output: "standalone"` — the Docker image copies the full
  // node_modules instead (see Dockerfile) so the Prisma CLI is available
  // at container-start time for migrations/seeding, which standalone's
  // server-runtime-only trace deliberately excludes.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // This app is never meant to be embedded in another site's frame.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Only honored by browsers over HTTPS, harmless to send always.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
