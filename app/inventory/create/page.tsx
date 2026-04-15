"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "../../components/PageShell";

function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function CreateInventoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const trimName = name.trim();
    const trimLocation = location.trim();
    if (!trimName || !trimLocation) {
      setError("Both fields are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimName, location: trimLocation }),
      });
      if (!res.ok) throw new Error();
      router.push("/inventory");
    } catch {
      setError("Failed to add item. Please try again.");
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <header className="page-header">
        <div className="page-header-top">
          <h1 className="page-title">Add Item</h1>
        </div>
        <p className="page-subtitle">Record a new item and where it's stored.</p>
      </header>

      <div className="form-card form-card--standalone">
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="item-name">Item Name</label>
          <input
            id="item-name"
            className="form-input"
            type="text"
            placeholder="e.g. Spare keys"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={saving}
            autoFocus
          />
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label" htmlFor="item-location">Location</label>
          <input
            id="item-location"
            className="form-input"
            type="text"
            placeholder="e.g. Hall cupboard, top shelf"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={saving}
          />
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary btn-full"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <SpinnerIcon /> : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
            {saving ? "Saving…" : "Save Item"}
          </button>
          <button
            className="btn btn-secondary btn-full"
            onClick={() => router.push("/inventory")}
            disabled={saving}
            style={{ marginTop: 10 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </PageShell>
  );
}
