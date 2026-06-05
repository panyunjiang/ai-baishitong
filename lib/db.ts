import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "ai_baishitong",
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  ssl: process.env.DB_SSL === "true" ? {} : undefined,
});

export default pool;
