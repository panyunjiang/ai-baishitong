/**
 * 给所有没有封面的文章设置 Unsplash AI 相关封面图
 * 运行: node scripts/update-covers.js
 */
const mysql = require('mysql2/promise');

// Unsplash 精选 AI/科技主题封面图
const covers = {
  'top-5-ai-agent-frameworks-2025': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  'claude-4-anthropic-reasoning-model-2025': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop',
  'rag-vector-database-enterprise-knowledge-base-2025': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
  'ai-art-beginners-guide': 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=400&fit=crop',
  'best-ai-tools-2026': 'https://images.unsplash.com/photo-1531746790095-e5f6f79be99b?w=800&h=400&fit=crop',
  'best-chinese-ai-tools-2026': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
  'best-ai-coding-tools-2026': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
  'ai-writing-tools-comparison': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop',
};

// 兜底：所有没有匹配到的文章用默认封面
const defaultCover = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop';

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER || '3UPgHbNiGGZWqjE.root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_baishitong',
    ssl: {},
    waitForConnections: true,
    connectionLimit: 2,
  });

  try {
    // 先查看所有文章
    const [articles] = await pool.query(
      "SELECT id, slug, cover FROM articles WHERE status = 'published'"
    );
    console.log(`找到 ${articles.length} 篇已发布文章`);

    let updated = 0;
    for (const article of articles) {
      const cover = covers[article.slug] || defaultCover;
      if (!article.cover) {
        await pool.query('UPDATE articles SET cover = ? WHERE id = ?', [cover, article.id]);
        console.log(`✅ 更新: ${article.slug} -> ${cover.substring(0, 60)}...`);
        updated++;
      } else {
        console.log(`⏭️ 跳过: ${article.slug} (已有封面)`);
      }
    }

    console.log(`\n完成！更新了 ${updated} 篇文章的封面`);
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message);
    console.error('请确认：1) 数据库密码正确  2) 本机IP已加入白名单');
  } finally {
    await pool.end();
  }
})();
