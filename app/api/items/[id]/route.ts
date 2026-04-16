import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      `SELECT id, name, category, room, area, spot, created_at, updated_at
       FROM inventory_items WHERE id = $1`,
      [params.id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/items/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, category, room, area, spot } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE inventory_items
       SET name = $1, category = $2, room = $3, area = $4, spot = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, category, room, area, spot, created_at, updated_at`,
      [
        name.trim(),
        (category ?? "").trim(),
        (room ?? "").trim(),
        (area ?? "").trim(),
        (spot ?? "").trim(),
        params.id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/items/[id] error:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      "DELETE FROM inventory_items WHERE id = $1",
      [params.id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/items/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
