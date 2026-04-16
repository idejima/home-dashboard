import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

export async function initDB() {
  // Rooms lookup table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE
    );
  `);

  // Seed default rooms if empty
  await pool.query(`
    INSERT INTO rooms (name)
    VALUES
      ('Living Room'), ('Kitchen'), ('Master Bedroom'),
      ('Bedroom'), ('Bathroom'), ('Storeroom'),
      ('Garage'), ('Study'), ('Dining Room'), ('Balcony')
    ON CONFLICT (name) DO NOTHING;
  `);

  // Categories lookup table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE
    );
  `);

  // Seed default categories if empty
  await pool.query(`
    INSERT INTO categories (name)
    VALUES
      ('Electronics'), ('Tools'), ('Clothes'), ('Food & Drinks'),
      ('Cleaning'), ('Medicine'), ('Documents'), ('Toys'),
      ('Sports'), ('Books'), ('Kitchen'), ('Miscellaneous')
    ON CONFLICT (name) DO NOTHING;
  `);

  // Inventory items — create with new schema if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT '',
      room        TEXT NOT NULL DEFAULT '',
      area        TEXT NOT NULL DEFAULT '',
      spot        TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Migrate: add new columns if the table already existed with old schema
  const cols = ['category', 'room', 'area', 'spot', 'updated_at'];
  for (const col of cols) {
    await pool.query(`
      ALTER TABLE inventory_items
      ADD COLUMN IF NOT EXISTS ${col} ${
        col === 'updated_at' ? 'TIMESTAMPTZ DEFAULT NOW()' : 'TEXT NOT NULL DEFAULT \'\''
      };
    `);
  }
}

export default pool;
