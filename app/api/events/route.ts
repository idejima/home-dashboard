import { NextResponse } from "next/server";
import pool, { initDB } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    const result = await pool.query(
      "SELECT id, title, date FROM calendar_events ORDER BY date ASC"
    );
    // Normalize date to YYYY-MM-DD string regardless of DB timezone
    const rows = result.rows.map((row) => ({
      ...row,
      date: row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date).slice(0, 10),
    }));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const { title, date } = body;

    if (!title?.trim() || !date) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
    }

    const result = await pool.query(
      "INSERT INTO calendar_events (title, date) VALUES ($1, $2) RETURNING id, title, date",
      [title.trim(), date]
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
    console.error("POST /api/events error:", err);
    return NextResponse.json({ error: "Failed to add event" }, { status: 500 });
  }
}
