import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id   SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
  `);

  await pool.query(`
    INSERT INTO rooms (name) VALUES
      ('Living Room'), ('Kitchen'), ('Master Bedroom'),
      ('Bedroom 1'), ('Bedroom 2'), ('Storeroom'),
      ('Study'), ('Balcony')
    ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id   SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
  `);

  await pool.query(`
    INSERT INTO categories (name) VALUES
      ('Electronics'), ('Tools'), ('Clothes'), ('Food & Drinks'),
      ('Cleaning'), ('Medicine'), ('Documents'), ('Toys'),
      ('Sports'), ('Books'), ('Kitchen'), ('Miscellaneous')
    ON CONFLICT (name) DO NOTHING;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      category   TEXT NOT NULL DEFAULT '',
      room       TEXT NOT NULL DEFAULT '',
      area       TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Safe migrations for existing tables
  const cols: [string, string][] = [
    ['category',   "TEXT NOT NULL DEFAULT ''"],
    ['room',       "TEXT NOT NULL DEFAULT ''"],
    ['area',       "TEXT NOT NULL DEFAULT ''"],
    ['updated_at', 'TIMESTAMPTZ DEFAULT NOW()'],
  ];
  for (const [col, def] of cols) {
    await pool.query(`
      ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS ${col} ${def};
    `);
  }

  // Drop spot column if it exists from a previous version
  await pool.query(`
    ALTER TABLE inventory_items DROP COLUMN IF EXISTS spot;
  `);
}

export default pool;
