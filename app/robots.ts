import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/submit"],
      },
    ],
    sitemap: "https://bs.aiv.yn.cn/sitemap.xml",
  };
}
