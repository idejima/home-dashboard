"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Me {
  id: number;
  name: string;
  username: string;
  role: string;
}

function SpinnerIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe]             = useState<Me | null>(null);
  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        setMe(data);
        setName(data.name ?? "");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  async function handleSave() {
    if (!name.trim() || saving) return;
    if (password && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const body: Record<string, string> = { name: name.trim() };
      if (password) body.password = password;

      const res = await fetch(`/api/users/${me?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
        return;
      }

      setSuccess("Profile updated successfully.");
      setPassword("");
      setConfirm("");

      // Refresh me
      const updated = await res.json();
      setMe(updated);
      setName(updated.name);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (!me) {
    return (
      <div className="app-wrapper">
        <div className="empty-state" style={{ marginTop: 60 }}>
          <SpinnerIcon /><span>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>My Profile</h1>
        <p>Update your name or change your password.</p>
      </header>

      <div className="form-card structured-form">
        {/* Read-only info */}
        <div className="form-group">
          <label className="form-label">Username</label>
          <div className="profile-readonly">{me.username}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <div className="profile-readonly">
            <span className={`role-badge role-${me.role}`}>{me.role}</span>
          </div>
        </div>

        <div className="form-divider" />

        {/* Editable name */}
        <div className="form-group">
          <label className="form-label" htmlFor="profile-name">Display Name</label>
          <input
            id="profile-name"
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-divider" />

        {/* Password change */}
        <div className="form-group">
          <label className="form-label" htmlFor="profile-pw">New Password <span className="form-label-hint">(leave blank to keep current)</span></label>
          <input
            id="profile-pw"
            className="form-input"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="profile-confirm">Confirm Password</label>
          <input
            id="profile-confirm"
            className="form-input"
            type="password"
            placeholder="Repeat new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={saving}
          />
        </div>

        {error && <p style={{ color: "#c0392b", fontSize: "0.85rem" }}>{error}</p>}
        {success && <p style={{ color: "var(--sage)", fontSize: "0.85rem" }}>{success}</p>}

        <button
          className="btn btn-primary btn-full"
          onClick={handleSave}
          disabled={saving || !name.trim()}
        >
          {saving ? <SpinnerIcon /> : <SaveIcon />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
