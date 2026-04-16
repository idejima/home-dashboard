import { NextResponse } from "next/server";
import pool, { initDB } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    const result = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id, name",
      [name.trim()]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/categories error:", err);
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}
