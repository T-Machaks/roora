import type { MetadataRoute } from "next";

// This is a private, invitation-only event site — nothing here should
// ever be indexed by search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
