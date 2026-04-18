import { NextResponse } from "next/server";
import pool, { initDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    await initDB();
    const result = await pool.query(
      "SELECT id, title, date, created_by FROM calendar_events ORDER BY date ASC"
    );
    const rows = result.rows.map((row) => ({
      ...row,
      date: row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date).slice(0, 10),
    }));
    return NextResponse.json(rows);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("GET /api/events error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await initDB();
    const { title, date } = await request.json();

    if (!title?.trim() || !date) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
    }

    const result = await pool.query(
      "INSERT INTO calendar_events (title, date, created_by) VALUES ($1, $2, $3) RETURNING id, title, date, created_by",
      [title.trim(), date, user.id]
    );

    const row = result.rows[0];
    return NextResponse.json(
      {
        ...row,
        date: row.date instanceof Date
          ? row.date.toISOString().slice(0, 10)
          : String(row.date).slice(0, 10),
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("POST /api/events error:", err);
    return NextResponse.json({ error: "Failed to add event" }, { status: 500 });
  }
}
