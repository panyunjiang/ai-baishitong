const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3UPgHbNiGGZWqjE.root',
    password: 'EeUHgZ962EWLnS5d',
    database: 'ai_baishitong',
    ssl: {}
  });

  // 删除重复的旧文章
  const duplicates = [60002, 60003]; // 旧的重复文章ID
  for (const id of duplicates) {
    const [rows] = await pool.query("SELECT title FROM articles WHERE id = ?", [id]);
    if (rows.length > 0) {
      await pool.query("UPDATE articles SET status = 'archived' WHERE id = ?", [id]);
      console.log('Archived:', id, rows[0].title);
    }
  }

  // 验证剩余文章
  const [all] = await pool.query("SELECT id, title FROM articles WHERE status='published' ORDER BY published_at DESC");
  console.log('\nRemaining articles (' + all.length + '):');
  all.forEach(a => console.log(a.id, a.title));

  await pool.end();
})();
