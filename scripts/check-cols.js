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

  const [cols] = await pool.query("SHOW COLUMNS FROM articles");
  cols.forEach(c => console.log(c.Field, c.Type));

  await pool.end();
})();
