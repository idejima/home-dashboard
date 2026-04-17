import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const result = await pool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name",
      [name.trim(), params.id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1",
      [params.id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
