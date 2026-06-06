import type { MetadataRoute } from "next";
import pool from "@/lib/db";

const BASE_URL = "https://bs.aiv.yn.cn";

function toISODate(d: unknown): string {
  if (!d) return new Date().toISOString();
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") {
    // 处理 "2026-06-05 14:35:05" 格式
    const date = new Date(d.replace(" ", "T") + "Z");
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/category`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    // 工具页面
    const [toolRows] = await pool.query(
      "SELECT slug, updated_at FROM tools WHERE status = 'active'"
    );
    const tools = (toolRows as { slug: string; updated_at: string }[]).map((t) => ({
      url: `${BASE_URL}/tool/${t.slug}`,
      lastModified: toISODate(t.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // 分类页面
    const [catRows] = await pool.query("SELECT slug FROM categories");
    const categories = (catRows as { slug: string }[]).map((c) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // 文章页面
    const [articleRows] = await pool.query(
      "SELECT slug, published_at FROM articles WHERE status = 'published'"
    );
    const articles = (articleRows as { slug: string; published_at: string }[]).map((a) => ({
      url: `${BASE_URL}/news/${a.slug}`,
      lastModified: toISODate(a.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...tools, ...categories, ...articles];
  } catch {
    return staticPages;
  }
}
