export const dynamic = 'force-dynamic';

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import pool from "@/lib/db";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticleCover } from "@/lib/covers";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";

function formatDate(d: unknown): string {
  if (typeof d === "string") return d.slice(0, 10);
  if (d instanceof Date) return d.toLocaleDateString("zh-CN");
  return String(d);
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover: string;
  category: string;
  tags: string;
  source: string;
  source_url: string;
  views: number;
  meta_title: string;
  meta_description: string;
  published_at: string;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const [rows] = await pool.query(
    "SELECT meta_title, meta_description, title, excerpt FROM articles WHERE slug = ? AND status = 'published'",
    [params.slug]
  );
  const articles = rows as Article[];
  if (articles.length === 0) return { title: "文章不存在 - AI百事通" };
  const article = articles[0];
  const cover = getArticleCover(article.slug, undefined, article.title);
  return {
    title: article.meta_title || `${article.title} | AI百事通`,
    description:
      article.meta_description || article.excerpt || article.title,
    alternates: {
      canonical: `https://bs.aiv.yn.cn/news/${params.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.meta_description || article.excerpt || article.title,
      url: `https://bs.aiv.yn.cn/news/${params.slug}`,
      type: "article",
      publishedTime: article.published_at,
      images: [{ url: cover, width: 800, height: 400 }],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [rows] = await pool.query(
    "SELECT * FROM articles WHERE slug = ? AND status = 'published'",
    [params.slug]
  );
  const articles = rows as Article[];
  if (articles.length === 0) notFound();
  const article = articles[0];

  // 增加阅读量（忽略错误）
  try {
    await pool.query(
      "UPDATE articles SET views = views + 1 WHERE id = ?",
      [article.id]
    );
  } catch {
    // ignore
  }

  // 相关文章
  const [relatedRows] = await pool.query(
    "SELECT id, title, slug, excerpt, cover, published_at FROM articles WHERE status = 'published' AND id != ? ORDER BY published_at DESC LIMIT 3",
    [article.id]
  );
  const relatedArticles = relatedRows as Article[];

  // 解析tags
  let tags: string[] = [];
  if (article.tags) {
    if (Array.isArray(article.tags)) {
      tags = article.tags;
    } else if (typeof article.tags === 'string') {
      try {
        const parsed = JSON.parse(article.tags);
        if (Array.isArray(parsed)) tags = parsed;
      } catch {
        tags = article.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
  }

  return (
    <div className="page-container">
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt || article.title}
        url={`https://bs.aiv.yn.cn/news/${article.slug}`}
        image={getArticleCover(article.slug, article.cover, article.title)}
        datePublished={article.published_at}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "首页", url: "https://bs.aiv.yn.cn" },
          { name: "AI资讯", url: "https://bs.aiv.yn.cn/news" },
          { name: article.title, url: `https://bs.aiv.yn.cn/news/${article.slug}` },
        ]}
      />
      {/* 返回链接 */}
      <div className="breadcrumb">
        <Link href="/">首页</Link>
        <span>/</span>
        <Link href="/news">AI资讯</Link>
        <span>/</span>
        <span style={{ color: "#64748b" }}>{article.title}</span>
      </div>

      {/* 文章内容 */}
      <article className="detail-card">
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            marginBottom: 12,
            lineHeight: 1.4,
          }}
        >
          {article.title}
        </h1>

        {/* 文章信息 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
            color: "#64748b",
            fontSize: "0.9rem",
          }}
        >
          <span>📅 {formatDate(article.published_at)}</span>
          {article.source && <span>📰 {article.source}</span>}
          <span>👁 {article.views || 0} 次阅读</span>
        </div>

        {/* 封面图 */}
        <img
          src={getArticleCover(article.slug, article.cover, article.title)}
          alt={article.title}
          style={{
            width: "100%",
            maxHeight: 400,
            objectFit: "cover",
            borderRadius: 8,
            marginBottom: 24,
          }}
        />

        {/* 标签 */}
        {tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 20,
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Markdown内容 - 去掉开头的标题避免与上方h1重复 */}
        <div className="article-content">
          <Markdown remarkPlugins={[remarkGfm]}>
            {(article.content || "").replace(/^#[^#].*\n?/, "").trim()}
          </Markdown>
        </div>

        {/* 来源链接 */}
        {article.source_url && (
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", fontSize: "0.9rem" }}
            >
              查看原文 →
            </a>
          </div>
        )}
      </article>

      {/* 相关文章 */}
      {relatedArticles.length > 0 && (
        <div className="news-section">
          <div className="news-header">
            <h2>📖 相关文章</h2>
          </div>
          <div className="news-grid">
            {relatedArticles.map((a) => (
              <Link
                key={a.id}
                href={`/news/${a.slug}`}
                className="news-card"
              >
                <img
                  src={getArticleCover(a.slug, a.cover, a.title)}
                  alt={a.title}
                  className="cover"
                />
                <div className="content">
                  <h3>{a.title}</h3>
                  <p>{a.excerpt}</p>
                  <div className="date">{formatDate(a.published_at)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
