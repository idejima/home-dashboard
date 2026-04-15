import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { location } = body;

    if (!location?.trim()) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const result = await pool.query(
      "UPDATE inventory_items SET location = $1 WHERE id = $2 RETURNING id, name, location",
      [location.trim(), params.id]
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
