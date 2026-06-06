export const dynamic = 'force-dynamic';

import Link from "next/link";
import type { Metadata } from "next";
import pool from "@/lib/db";

export const metadata: Metadata = {
  title: "AI资讯 - 最新AI行业动态 | AI百事通",
  description: "获取最新的人工智能行业资讯、AI工具评测、技术趋势分析。",
};

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
  cover: string;
  source: string;
  published_at: string;
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  // 获取总数
  const [countRows] = await pool.query(
    "SELECT COUNT(*) as total FROM articles WHERE status = 'published'"
  );
  const total = (countRows as { total: number }[])[0].total;
  const totalPages = Math.ceil(total / pageSize);

  // 获取文章
  const [articleRows] = await pool.query(
    "SELECT id, title, slug, excerpt, cover, source, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT ? OFFSET ?",
    [pageSize, offset]
  );
  const articles = articleRows as Article[];

  return (
    <div className="page-container">
      <h1 className="page-title">📰 AI资讯</h1>

      {articles.length > 0 ? (
        <div className="news-grid" style={{ padding: 0 }}>
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="news-card"
            >
              {article.cover ? (
                <img
                  src={article.cover}
                  alt={article.title}
                  className="cover"
                />
              ) : (
                <div
                  className="cover"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                  }}
                >
                  🤖
                </div>
              )}
              <div className="content">
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span className="date">
                    {formatDate(article.published_at)}
                  </span>
                  {article.source && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {article.source}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="icon">📰</div>
          <p>暂无资讯</p>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="pagination">
          {page > 1 && (
            <Link href={`/news?page=${page - 1}`}>← 上一页</Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || Math.abs(p - page) <= 2
            )
            .map((p, idx, arr) => (
              <span key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span style={{ padding: "8px 4px", color: "#94a3b8" }}>
                    ...
                  </span>
                )}
                {p === page ? (
                  <span className="active">{p}</span>
                ) : (
                  <Link href={`/news?page=${p}`}>{p}</Link>
                )}
              </span>
            ))}
          {page < totalPages && (
            <Link href={`/news?page=${page + 1}`}>下一页 →</Link>
          )}
        </div>
      )}
    </div>
  );
}
