import { NextResponse } from "next/server";
import pool, { initDB } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    const result = await pool.query(
      "SELECT id, name, location FROM inventory_items ORDER BY created_at ASC"
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
    const { name, location } = body;

    if (!name?.trim() || !location?.trim()) {
      return NextResponse.json({ error: "Name and location are required" }, { status: 400 });
    }

    const result = await pool.query(
      "INSERT INTO inventory_items (name, location) VALUES ($1, $2) RETURNING id, name, location",
      [name.trim(), location.trim()]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/items error:", err);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
