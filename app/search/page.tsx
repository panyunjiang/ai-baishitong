export const dynamic = 'force-dynamic';

import Link from "next/link";
import type { Metadata } from "next";
import pool from "@/lib/db";

const AVATAR_COLORS = [
  "#2563eb", "#dc2626", "#059669", "#d97706",
  "#7c3aed", "#0891b2", "#be185d", "#4f46e5",
  "#15803d", "#b45309", "#6d28d9", "#0e7490",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const metadata: Metadata = {
  title: "搜索AI工具 | AI百事通",
  description: "搜索你需要的AI工具，快速找到最适合的AI助手。",
};

interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_type: string;
  has_chinese: number;
  rating: number;
  is_hot: number;
  is_new: number;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q || "").trim();
  let tools: Tool[] = [];

  if (query) {
    const [rows] = await pool.query(
      "SELECT id, name, slug, description, price_type, has_chinese, rating, is_hot, is_new FROM tools WHERE status = 'active' AND (name LIKE ? OR description LIKE ?) ORDER BY rating DESC LIMIT 50",
      [`%${query}%`, `%${query}%`]
    );
    tools = rows as Tool[];
  }

  return (
    <div className="page-container">
      <h1 className="page-title">🔍 搜索AI工具</h1>

      {/* 搜索框 */}
      <form
        action="/search"
        method="GET"
        style={{
          maxWidth: 600,
          marginBottom: 32,
        }}
      >
        <div className="search-box" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <input
            type="text"
            name="q"
            placeholder="输入工具名称或关键词..."
            defaultValue={query}
            autoComplete="off"
          />
          <button type="submit">搜索</button>
        </div>
      </form>

      {/* 结果 */}
      {query ? (
        <>
          <p style={{ color: "#64748b", marginBottom: 20, fontSize: "0.95rem" }}>
            {tools.length > 0
              ? `找到 ${tools.length} 个与"${query}"相关的工具`
              : `未找到与"${query}"相关的工具`}
          </p>

          {tools.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12,
              }}
            >
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tool/${tool.slug}`}
                  className="tool-card"
                >
                  <div
                    className="tool-avatar"
                    style={{ background: getAvatarColor(tool.name) }}
                  >
                    {tool.name.charAt(0)}
                  </div>
                  <div className="tool-info">
                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                    <div className="tool-tags">
                      {tool.price_type === "free" && (
                        <span className="tag-free">免费</span>
                      )}
                      {tool.price_type === "paid" && (
                        <span className="tag-paid">付费</span>
                      )}
                      {tool.price_type === "freemium" && (
                        <span className="tag-freemium">免费试用</span>
                      )}
                      {tool.has_chinese === 1 && <span>中文</span>}
                      {tool.rating > 0 && (
                        <span className="tag-rating">⭐ {tool.rating}</span>
                      )}
                      {tool.is_hot === 1 && (
                        <span className="tag-hot">🔥 热门</span>
                      )}
                      {tool.is_new === 1 && (
                        <span className="tag-new">新品</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <p>换个关键词试试？</p>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="icon">💡</div>
          <p>输入关键词开始搜索</p>
        </div>
      )}
    </div>
  );
}
