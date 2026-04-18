import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", process.env.PASSWORD_SECRET ?? "homedash-secret-change-me")
    .update(password)
    .digest("hex");
}
