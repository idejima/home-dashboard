import { NextResponse } from "next/server";
import pool, { initDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    await initDB();
    const result = await pool.query(
      `SELECT
         i.id, i.name, i.category, i.room, i.area,
         i.created_by, i.created_at, i.updated_at,
         u.name AS creator_name
       FROM inventory_items i
       LEFT JOIN users u ON u.id = i.created_by
       ORDER BY i.created_at ASC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("GET /api/items error:", err);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await initDB();
    const body = await request.json();
    const { name, category, room, area } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO inventory_items (name, category, room, area, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, category, room, area, created_by, created_at, updated_at`,
      [name.trim(), (category ?? "").trim(), (room ?? "").trim(), (area ?? "").trim(), user.id]
    );

    // Attach creator name
    const row = result.rows[0];
    return NextResponse.json({ ...row, creator_name: user.name }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("POST /api/items error:", err);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
