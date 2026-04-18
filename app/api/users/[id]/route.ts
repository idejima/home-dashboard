import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/auth";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", process.env.PASSWORD_SECRET ?? "homedash-secret-change-me")
    .update(password)
    .digest("hex");
}

// PUT — admin can change role; user can update own name/password
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    const targetId = parseInt(params.id, 10);
    const body = await request.json();

    const isSelf = currentUser.id === targetId;
    const isAdmin = currentUser.role === "admin";

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build update fields
    const updates: string[] = [];
    const values: (string | number)[] = [];
    let idx = 1;

    if (body.name?.trim()) {
      updates.push(`name = $${idx++}`);
      values.push(body.name.trim());
    }

    if (body.password) {
      updates.push(`password = $${idx++}`);
      values.push(hashPassword(body.password));
    }

    // Only admin can change role
    if (isAdmin && body.role && (body.role === "admin" || body.role === "member")) {
      updates.push(`role = $${idx++}`);
      values.push(body.role);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    values.push(targetId);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx} RETURNING id, name, username, role, created_at`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("PUT /api/users/[id] error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE — admin only (including deleting themselves)
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const targetId = parseInt(params.id, 10);

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [targetId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("DELETE /api/users/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
