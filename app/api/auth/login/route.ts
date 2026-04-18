import { NextResponse } from "next/server";
import pool, { initDB } from "@/lib/db";
import crypto from "crypto";

function hashPassword(password: string): string {
  // SHA-256 with a fixed app salt — simple, no bcrypt dependency needed
  return crypto
    .createHmac("sha256", process.env.PASSWORD_SECRET ?? "homedash-secret-change-me")
    .update(password)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    await initDB();
    const { username, password } = await request.json();

    if (!username?.trim() || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // Look up user
    const userResult = await pool.query(
      "SELECT id, name, username, role, password FROM users WHERE username = $1",
      [username.trim().toLowerCase()]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = userResult.rows[0];
    const hashed = hashPassword(password);

    if (hashed !== user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create session
    const sessionId = crypto.randomUUID();
    await pool.query(
      "INSERT INTO sessions (id, user_id) VALUES ($1, $2)",
      [sessionId, user.id]
    );

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    });

    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

// Also export hashPassword so it can be used by the user management API
export { hashPassword };
