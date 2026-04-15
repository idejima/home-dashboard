import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      "DELETE FROM calendar_events WHERE id = $1",
      [params.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
