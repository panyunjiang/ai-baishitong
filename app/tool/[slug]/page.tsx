export const dynamic = 'force-dynamic';

import Link from "next/link";
import { notFound } from "next/navigation";
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

interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  features: string;
  website: string;
  price_type: string;
  price_info: string;
  has_chinese: number;
  rating: number;
  is_hot: number;
  is_new: number;
  is_featured: number;
  meta_title: string;
  meta_description: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface SimilarTool {
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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const [rows] = await pool.query(
    "SELECT meta_title, meta_description, name, description FROM tools WHERE slug = ? AND status = 'active'",
    [params.slug]
  );
  const tools = rows as (Tool & { name: string; description: string })[];
  if (tools.length === 0) return { title: "工具不存在 - AI百事通" };
  const tool = tools[0];
  return {
    title: tool.meta_title || `${tool.name} - AI工具详情 | AI百事通`,
    description:
      tool.meta_description ||
      tool.description ||
      `${tool.name}的详细介绍和使用指南`,
  };
}

export default async function ToolDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let tool: Tool;
  let category: Category | null = null;
  let similarTools: SimilarTool[] = [];

  try {
    const [toolRows] = await pool.query(
      "SELECT * FROM tools WHERE slug = ? AND status = 'active'",
      [params.slug]
    );
    const tools = toolRows as Tool[];
    if (tools.length === 0) notFound();
    tool = tools[0];

    // 获取分类信息
    const [catRows] = await pool.query(
      "SELECT id, name, slug, icon FROM categories WHERE id = ?",
      [tool.category_id]
    );
    const categories = catRows as Category[];
    category = categories[0] || null;

    // 获取类似工具
    const [similarRows] = await pool.query(
      "SELECT id, name, slug, description, price_type, has_chinese, rating, is_hot, is_new FROM tools WHERE category_id = ? AND id != ? AND status = 'active' ORDER BY rating DESC LIMIT 4",
      [tool.category_id, tool.id]
    );
    similarTools = similarRows as SimilarTool[];
  } catch {
    notFound();
  }

  // 解析features
  let features: string[] = [];
  if (tool.features) {
    try {
      const parsed = JSON.parse(tool.features);
      if (Array.isArray(parsed)) features = parsed;
    } catch {
      // 如果不是JSON，按换行分割
      features = tool.features.split("\n").filter((f: string) => f.trim());
    }
  }

  return (
    <div className="page-container">
      {/* 面包屑 */}
      <div className="breadcrumb">
        <Link href="/">首页</Link>
        <span>/</span>
        {category && (
          <>
            <Link href={`/category/${category.slug}`}>{category.name}</Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: "#64748b" }}>{tool.name}</span>
      </div>

      {/* 工具信息 */}
      <div className="detail-card">
        {/* 头部 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: getAvatarColor(tool.name),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
            }}
          >
            {tool.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {tool.name}
            </h1>
            <div className="tool-tags" style={{ marginBottom: 8 }}>
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
              {tool.is_hot === 1 && <span className="tag-hot">🔥 热门</span>}
              {tool.is_new === 1 && <span className="tag-new">新品</span>}
            </div>
          </div>
        </div>

        {/* 简介 */}
        {tool.description && (
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              📋 简介
            </h2>
            <p style={{ color: "#475569", lineHeight: 1.8 }}>
              {tool.description}
            </p>
          </div>
        )}

        {/* 功能特点 */}
        {features.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              ✨ 功能特点
            </h2>
            <ul style={{ paddingLeft: 20 }}>
              {features.map((feat, i) => (
                <li
                  key={i}
                  style={{
                    color: "#475569",
                    lineHeight: 1.8,
                    marginBottom: 4,
                  }}
                >
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 价格信息 */}
        {tool.price_info && (
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              💰 价格信息
            </h2>
            <p style={{ color: "#475569", lineHeight: 1.8 }}>
              {tool.price_info}
            </p>
          </div>
        )}

        {/* 访问按钮 */}
        {tool.website && (
          <div style={{ marginTop: 24 }}>
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                display: "inline-block",
                textDecoration: "none",
                fontSize: "1rem",
              }}
            >
              访问官网 →
            </a>
          </div>
        )}
      </div>

      {/* 类似工具推荐 */}
      {similarTools.length > 0 && (
        <div className="detail-card">
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            🔗 类似工具推荐
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {similarTools.map((t) => (
              <Link
                key={t.id}
                href={`/tool/${t.slug}`}
                className="tool-card"
              >
                <div
                  className="tool-avatar"
                  style={{ background: getAvatarColor(t.name) }}
                >
                  {t.name.charAt(0)}
                </div>
                <div className="tool-info">
                  <h3>{t.name}</h3>
                  <p>{t.description}</p>
                  <div className="tool-tags">
                    {t.price_type === "free" && (
                      <span className="tag-free">免费</span>
                    )}
                    {t.price_type === "paid" && (
                      <span className="tag-paid">付费</span>
                    )}
                    {t.price_type === "freemium" && (
                      <span className="tag-freemium">免费试用</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
