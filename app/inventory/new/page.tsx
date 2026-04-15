"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

export default function NewInventoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const trimName = name.trim();
    const trimLocation = location.trim();
    if (!trimName || !trimLocation || saving) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimName, location: trimLocation }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      router.push("/inventory");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Add Item</h1>
        <p>Everything in the household, in one place.</p>
      </header>

      <div className="page-back">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => router.push("/inventory")}
        >
          <BackIcon /> Back to Inventory
        </button>
      </div>

      <div className="form-card" style={{ maxWidth: 480 }}>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label" htmlFor="item-name">Item Name</label>
          <input
            id="item-name"
            className="form-input"
            type="text"
            placeholder="e.g. Spare batteries"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={saving}
            autoFocus
          />
        </div>
        <div className="form-group" style={{ marginBottom: 4 }}>
          <label className="form-label" htmlFor="item-location">Storage Location</label>
          <input
            id="item-location"
            className="form-input"
            type="text"
            placeholder="e.g. Kitchen drawer"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={saving}
          />
        </div>

        {error && (
          <p style={{ color: "var(--rust)", fontSize: "0.85rem", marginTop: 12 }}>{error}</p>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={saving || !name.trim() || !location.trim()}
        >
          {saving ? <SpinnerIcon /> : <PlusIcon />}
          {saving ? "Saving…" : "Add Item"}
        </button>
      </div>
    </div>
  );
}
