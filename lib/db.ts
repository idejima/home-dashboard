import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

export async function initDB() {
  // ── Rooms ──
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

  // ── Categories ──
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

  // ── Users ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      username   TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Sessions ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id         TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
    );
  `);

  // ── Inventory items ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      category   TEXT NOT NULL DEFAULT '',
      room       TEXT NOT NULL DEFAULT '',
      area       TEXT NOT NULL DEFAULT '',
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Calendar events ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      date       DATE NOT NULL,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // ── Safe migrations for existing tables ──
  const itemCols: [string, string][] = [
    ['category',   "TEXT NOT NULL DEFAULT ''"],
    ['room',       "TEXT NOT NULL DEFAULT ''"],
    ['area',       "TEXT NOT NULL DEFAULT ''"],
    ['updated_at', 'TIMESTAMPTZ DEFAULT NOW()'],
    ['created_by', 'INTEGER REFERENCES users(id) ON DELETE SET NULL'],
  ];
  for (const [col, def] of itemCols) {
    await pool.query(`ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS ${col} ${def};`);
  }

  await pool.query(`ALTER TABLE inventory_items DROP COLUMN IF EXISTS spot;`);

  await pool.query(`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;`);
}

export default pool;
