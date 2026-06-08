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

  // 把 enum 改成 varchar，支持自定义来源名称
  await pool.query("ALTER TABLE articles MODIFY COLUMN source VARCHAR(100) DEFAULT 'AI百事通编辑部'");
  console.log('Column altered to VARCHAR(100)');

  const sources = ['AI百事通编辑部', 'AI前沿观察', '科技早知道', 'AI工具评测室', '智能未来研究所'];
  const [all] = await pool.query("SELECT id FROM articles WHERE source IN ('ai_generated', 'original')");
  for (const a of all) {
    const s = sources[Math.floor(Math.random() * sources.length)];
    await pool.query('UPDATE articles SET source = ? WHERE id = ?', [s, a.id]);
  }
  console.log('Updated', all.length, 'articles');

  // 验证
  const [check] = await pool.query('SELECT source, COUNT(*) as c FROM articles GROUP BY source');
  console.log('Current sources:', JSON.stringify(check));

  await pool.end();
})();
