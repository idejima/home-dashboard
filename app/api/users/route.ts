import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", process.env.PASSWORD_SECRET ?? "homedash-secret-change-me")
    .update(password)
    .digest("hex");
}

export async function GET() {
  try {
    await requireAdmin();
    const result = await pool.query(
      "SELECT id, name, username, role, created_at FROM users ORDER BY created_at ASC"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("GET /api/users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { name, username, password, role } = await request.json();

    if (!name?.trim() || !username?.trim() || !password) {
      return NextResponse.json({ error: "Name, username, and password are required" }, { status: 400 });
    }

    const validRole = role === "admin" ? "admin" : "member";
    const hashed = hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (name, username, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, username, role, created_at`,
      [name.trim(), username.trim().toLowerCase(), hashed, validRole]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    if ((err as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    console.error("POST /api/users error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
