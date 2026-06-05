export const dynamic = 'force-dynamic';

import Link from "next/link";
import type { Metadata } from "next";
import pool from "@/lib/db";

export const metadata: Metadata = {
  title: "AI工具合集 - 分类浏览 | AI百事通",
  description: "按分类浏览所有AI工具，涵盖对话聊天、图像生成、编程开发、写作助手等多个领域。",
};

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  tool_count: number;
}

export default async function CategoryIndexPage() {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.slug, c.icon, c.description,
     (SELECT COUNT(*) FROM tools t WHERE t.category_id = c.id AND t.status = 'active') as tool_count
     FROM categories c ORDER BY c.sort_order ASC`
  );
  const categories = rows as Category[];

  return (
    <div className="page-container">
      <h1 className="page-title">📂 AI工具合集</h1>
      <p style={{ color: "#64748b", marginBottom: 24, fontSize: "0.95rem" }}>
        按分类浏览所有收录的AI工具，找到最适合你的AI助手。
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px",
              background: "white",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: "2rem" }}>{cat.icon}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {cat.name}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                {cat.tool_count} 个工具
              </div>
              {cat.description && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#94a3b8",
                    marginTop: 4,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {cat.description}
                </div>
              )}
            </div>
            <span style={{ color: "#94a3b8", fontSize: "1.2rem" }}>→</span>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="empty-state">
          <div className="icon">📂</div>
          <p>暂无分类</p>
        </div>
      )}
    </div>
  );
}
