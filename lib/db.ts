import { Pool } from "pg";

// Render injects DATABASE_URL automatically when you link a PostgreSQL service
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Creates tables if they don't already exist — runs on every cold start (safe)
export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id        SERIAL PRIMARY KEY,
      name      TEXT NOT NULL,
      location  TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id        SERIAL PRIMARY KEY,
      title     TEXT NOT NULL,
      date      DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export default pool;
