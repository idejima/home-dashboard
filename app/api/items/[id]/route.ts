import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const result = await pool.query(
      `SELECT id, name, category, room, area, created_by, created_at, updated_at
       FROM inventory_items WHERE id = $1`,
      [params.id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("GET /api/items/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, category, room, area } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check ownership
    const existing = await pool.query(
      "SELECT created_by FROM inventory_items WHERE id = $1",
      [params.id]
    );
    if (existing.rowCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const isOwner = existing.rows[0].created_by === user.id;
    if (!isOwner && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await pool.query(
      `UPDATE inventory_items
       SET name = $1, category = $2, room = $3, area = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, category, room, area, created_by, created_at, updated_at`,
      [name.trim(), (category ?? "").trim(), (room ?? "").trim(), (area ?? "").trim(), params.id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("PUT /api/items/[id] error:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const existing = await pool.query(
      "SELECT created_by FROM inventory_items WHERE id = $1",
      [params.id]
    );
    if (existing.rowCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const isOwner = existing.rows[0].created_by === user.id;
    if (!isOwner && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await pool.query("DELETE FROM inventory_items WHERE id = $1", [params.id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("DELETE /api/items/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
