import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST() {
  try {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
      await pool.query("DELETE FROM sessions WHERE id = $1", [sessionId]);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("session_id", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (err) {
    console.error("POST /api/auth/logout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
