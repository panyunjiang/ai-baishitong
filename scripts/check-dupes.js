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

  const [all] = await pool.query("SELECT id, title, slug, cover FROM articles WHERE status='published' ORDER BY published_at DESC");
  console.log('All articles (' + all.length + '):');
  all.forEach(a => console.log(a.id, '|', a.title, '|', a.cover || 'no-cover'));

  // 查完全重复标题
  const [dupes] = await pool.query("SELECT title, GROUP_CONCAT(id) as ids, COUNT(*) as c FROM articles WHERE status='published' GROUP BY title HAVING c > 1");
  console.log('\nExact duplicate titles:', JSON.stringify(dupes, null, 2));

  await pool.end();
})();
