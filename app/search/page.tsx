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

const hotSearches = [
  "ChatGPT", "Claude", "Midjourney", "Cursor",
  "DeepSeek", "豆包", "Kimi", "写作",
  "编程", "绘画", "免费", "国产",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q || "").trim();
  let tools: Tool[] = [];
  let hotTools: Tool[] = [];

  if (query) {
    const [rows] = await pool.query(
      "SELECT id, name, slug, description, price_type, has_chinese, rating, is_hot, is_new FROM tools WHERE status = 'active' AND (name LIKE ? OR description LIKE ?) ORDER BY rating DESC LIMIT 50",
      [`%${query}%`, `%${query}%`]
    );
    tools = rows as Tool[];
  }

  // 热门推荐工具（无搜索时展示）
  if (!query) {
    const [hotRows] = await pool.query(
      "SELECT id, name, slug, description, price_type, has_chinese, rating, is_hot, is_new FROM tools WHERE status = 'active' AND is_hot = 1 ORDER BY rating DESC LIMIT 6"
    );
    hotTools = hotRows as Tool[];
  }

  return (
    <div className="page-container">
      <h1 className="page-title">🔍 搜索AI工具</h1>

      {/* 搜索框 */}
      <form
        action="/search"
        method="GET"
        style={{ maxWidth: 600, margin: "0 auto 24px" }}
      >
        <div
          className="search-box"
          style={{
            boxShadow: "0 2px 12px rgba(37,99,235,0.15)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <input
            type="text"
            name="q"
            placeholder="输入工具名称或关键词..."
            defaultValue={query}
            autoComplete="off"
            autoFocus
          />
          <button type="submit">搜索</button>
        </div>
      </form>

      {/* 热门搜索标签 */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto 32px",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {hotSearches.map((tag) => (
          <Link
            key={tag}
            href={`/search?q=${encodeURIComponent(tag)}`}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: "0.85rem",
              background: query === tag ? "#2563eb" : "#f1f5f9",
              color: query === tag ? "white" : "#475569",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* 搜索结果 */}
      {query ? (
        <>
          <p
            style={{
              color: "#64748b",
              marginBottom: 20,
              fontSize: "0.95rem",
              textAlign: "center",
            }}
          >
            {tools.length > 0
              ? `找到 ${tools.length} 个与「${query}」相关的工具`
              : `未找到与「${query}」相关的工具`}
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
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>😅</div>
              <p style={{ color: "#64748b", marginBottom: 24, fontSize: "1.05rem" }}>
                没找到「{query}」相关的工具
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 24 }}>
                试试其他关键词，或者浏览下面的热门工具
              </p>
              {hotTools.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 12,
                    maxWidth: 900,
                    margin: "0 auto",
                    textAlign: "left",
                  }}
                >
                  {hotTools.map((tool) => (
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
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* 无搜索时展示热门推荐 */
        <div style={{ textAlign: "center" }}>
          {hotTools.length > 0 && (
            <>
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: 20,
                }}
              >
                🔥 热门推荐
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 12,
                  maxWidth: 900,
                  margin: "0 auto",
                  textAlign: "left",
                }}
              >
                {hotTools.map((tool) => (
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
                        {tool.is_hot === 1 && (
                          <span className="tag-hot">🔥 热门</span>
                        )}
                        {tool.rating > 0 && (
                          <span className="tag-rating">⭐ {tool.rating}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
