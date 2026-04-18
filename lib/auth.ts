import { cookies } from "next/headers";
import pool from "@/lib/db";

export interface SessionUser {
  id: number;
  name: string;
  username: string;
  role: "admin" | "member";
}

/**
 * Reads the session cookie and returns the logged-in user, or null.
 * Call this from API route handlers (server-side only).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    if (!sessionId) return null;

    const result = await pool.query(
      `SELECT u.id, u.name, u.username, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [sessionId]
    );

    if (result.rowCount === 0) return null;
    return result.rows[0] as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Returns the session user or throws a 401 JSON response.
 * Convenience wrapper for API routes.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

/**
 * Returns the session user if they are an admin, or throws 403.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
