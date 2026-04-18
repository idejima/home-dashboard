import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const existing = await pool.query(
      "SELECT created_by FROM calendar_events WHERE id = $1",
      [params.id]
    );
    if (existing.rowCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isOwner = existing.rows[0].created_by === user.id;
    if (!isOwner && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await pool.query("DELETE FROM calendar_events WHERE id = $1", [params.id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("DELETE /api/events/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
