import { NextResponse } from "next/server";
import pool, { initDB } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    const result = await pool.query(
      `SELECT id, name, category, room, area, created_at, updated_at
       FROM inventory_items ORDER BY created_at ASC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /api/items error:", err);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const { name, category, room, area } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO inventory_items (name, category, room, area)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, category, room, area, created_at, updated_at`,
      [name.trim(), (category ?? "").trim(), (room ?? "").trim(), (area ?? "").trim()]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/items error:", err);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
