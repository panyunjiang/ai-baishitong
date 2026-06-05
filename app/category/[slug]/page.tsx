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

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const [rows] = await pool.query(
    "SELECT name, description FROM categories WHERE slug = ?",
    [params.slug]
  );
  const cats = rows as Category[];
  if (cats.length === 0) return { title: "分类不存在 - AI百事通" };
  const cat = cats[0];
  return {
    title: `${cat.name} - AI工具合集 | AI百事通`,
    description: cat.description || `${cat.name}分类下的AI工具合集`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { filter?: string };
}) {
  const [catRows] = await pool.query(
    "SELECT id, name, slug, icon, description FROM categories WHERE slug = ?",
    [params.slug]
  );
  const cats = catRows as Category[];
  if (cats.length === 0) notFound();
  const category = cats[0];

  // 构建查询
  let sql =
    "SELECT id, name, slug, description, price_type, has_chinese, rating, is_hot, is_new FROM tools WHERE status = 'active' AND category_id = ?";
  const queryParams: unknown[] = [category.id];

  const filter = searchParams.filter;
  if (filter === "free") {
    sql += " AND price_type = 'free'";
  } else if (filter === "paid") {
    sql += " AND price_type IN ('paid', 'freemium')";
  } else if (filter === "chinese") {
    sql += " AND has_chinese = 1";
  }

  sql += " ORDER BY rating DESC, id DESC";

  const [toolRows] = await pool.query(sql, queryParams);
  const tools = toolRows as Tool[];

  return (
    <div className="page-container">
      {/* 面包屑 */}
      <div className="breadcrumb">
        <Link href="/">首页</Link>
        <span>/</span>
        <Link href="/category">AI工具合集</Link>
        <span>/</span>
        <span style={{ color: "#64748b" }}>{category.name}</span>
      </div>

      {/* 分类信息 */}
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "2.5rem" }}>{category.icon}</span>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>
              {category.name}
            </h1>
            {category.description && (
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 筛选 */}
      <div className="filter-bar">
        <Link
          href={`/category/${category.slug}`}
          className={`filter-btn ${!filter ? "active" : ""}`}
        >
          全部
        </Link>
        <Link
          href={`/category/${category.slug}?filter=free`}
          className={`filter-btn ${filter === "free" ? "active" : ""}`}
        >
          免费
        </Link>
        <Link
          href={`/category/${category.slug}?filter=paid`}
          className={`filter-btn ${filter === "paid" ? "active" : ""}`}
        >
          付费
        </Link>
        <Link
          href={`/category/${category.slug}?filter=chinese`}
          className={`filter-btn ${filter === "chinese" ? "active" : ""}`}
        >
          支持中文
        </Link>
      </div>

      {/* 工具列表 */}
      {tools.length > 0 ? (
        <div className="category-tools" style={{ padding: 0 }}>
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
                  {tool.is_hot === 1 && <span className="tag-hot">🔥 热门</span>}
                  {tool.is_new === 1 && <span className="tag-new">新品</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <p>该分类下暂无工具</p>
        </div>
      )}
    </div>
  );
}
