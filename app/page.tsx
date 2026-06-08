export const dynamic = 'force-dynamic';

import Link from "next/link";
import pool from "@/lib/db";
import { getArticleCover } from "@/lib/covers";
import { WebsiteJsonLd } from "@/components/JsonLd";
import CoverImage from "@/components/CoverImage";

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

function formatDate(d: unknown): string {
  if (typeof d === "string") return d.slice(0, 10);
  if (d instanceof Date) return d.toLocaleDateString("zh-CN");
  return String(d);
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
  category_id: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  published_at: string;
}

export default async function HomePage() {
  // 获取分类
  const [catRows] = await pool.query(
    "SELECT id, name, slug, icon, description FROM categories ORDER BY sort_order ASC"
  );
  const categories = catRows as Category[];

  // 获取active工具
  const [toolRows] = await pool.query(
    "SELECT id, name, slug, description, price_type, has_chinese, rating, is_hot, is_new, category_id FROM tools WHERE status = 'active' ORDER BY rating DESC, id DESC"
  );
  const allTools = toolRows as Tool[];

  // 获取已发布资讯（最新3条）
  const [articleRows] = await pool.query(
    "SELECT id, title, slug, excerpt, cover, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 3"
  );
  const articles = articleRows as Article[];

  // 按分类分组工具
  const toolsByCategory = new Map<number, Tool[]>();
  for (const tool of allTools) {
    const list = toolsByCategory.get(tool.category_id) || [];
    list.push(tool);
    toolsByCategory.set(tool.category_id, list);
  }

  // 只显示有工具的分类
  const activeCategories = categories.filter(
    (cat) => (toolsByCategory.get(cat.id) || []).length > 0
  );

  const quickTags = [
    "ChatGPT", "Midjourney", "Cursor", "Sora",
    "DeepSeek", "豆包", "Kimi", "Claude",
  ];

  return (
    <div>
      <WebsiteJsonLd />
      {/* Hero */}
      <section className="hero-section">
        <h1>AI百事通</h1>
        <p>发现最好用的AI工具，让AI为你所用</p>
        <form action="/search" method="GET" className="search-box">
          <input
            type="text"
            name="q"
            placeholder="搜索AI工具..."
            autoComplete="off"
          />
          <button type="submit">搜索</button>
        </form>
        <div className="quick-tags">
          {quickTags.map((tag) => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
              {tag}
            </Link>
          ))}
        </div>
      </section>

      {/* 分类板块 */}
      <section className="section-container" style={{ paddingTop: 32 }}>
        {activeCategories.map((cat) => {
          const tools = toolsByCategory.get(cat.id) || [];
          const displayTools = tools.slice(0, 8);
          return (
            <div key={cat.id} className="category-card">
              <div className="category-header">
                <span className="icon">{cat.icon}</span>
                <h2>{cat.name}</h2>
                <span className="count">{tools.length} 个工具</span>
                <Link href={`/category/${cat.slug}`} className="more-link">
                  更多→
                </Link>
              </div>
              <div className="category-tools">
                {displayTools.map((tool) => (
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
                        {tool.has_chinese === 1 && (
                          <span>中文</span>
                        )}
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
            </div>
          );
        })}

        {activeCategories.length === 0 && (
          <div className="empty-state">
            <div className="icon">📦</div>
            <p>暂无工具数据，请先导入数据</p>
          </div>
        )}
      </section>

      {/* 资讯区域 */}
      {articles.length > 0 && (
        <section className="section-container">
          <div className="news-section">
            <div className="news-header">
              <h2>📰 最新资讯</h2>
              <Link href="/news" className="more-link" style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
                更多→
              </Link>
            </div>
            <div className="news-grid">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="news-card"
                >
                  <CoverImage
                    src={getArticleCover(article.slug, article.cover, article.title)}
                    alt={article.title}
                    className="cover"
                  />
                  <div className="content">
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <div className="date">{formatDate(article.published_at)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
