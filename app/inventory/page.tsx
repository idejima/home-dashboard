"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface InventoryItem {
  id: number;
  name: string;
  location: string;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
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

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function InventoryPage() {
  const router = useRouter();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLocation, setEditLocation] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      setError("Could not load inventory. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      alert("Failed to delete. Please refresh.");
      fetchItems();
    }
  }

  function startEdit(item: InventoryItem) {
    setEditingId(item.id);
    setEditLocation(item.location);
  }

  async function saveEdit(id: number) {
    const location = editLocation.trim();
    if (!location || editSaving) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setEditingId(null);
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Inventory</h1>
        <p>Everything in the household, in one place.</p>
      </header>

      {/* Search + Add button row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, alignItems: "center" }}>
        <div className="search-wrapper" style={{ marginBottom: 0, flex: 1 }}>
          <SearchIcon />
          <input
            className="search-input"
            type="search"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/inventory/new")}
          style={{ flexShrink: 0 }}
        >
          <PlusIcon /> Add Item
        </button>
      </div>

      <section className="section">
        <div className="section-header">
          <div className="section-header-left">
            <h2 className="section-title">All Items</h2>
            {!loading && (
              <span className="section-count">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <SpinnerIcon />
            <span>Loading inventory…</span>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ color: "var(--rust)" }}>{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <BoxIcon />
            {search
              ? `No items matching "${search}"`
              : "No items yet — tap 'Add Item' to get started."}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                {editingId === item.id ? (
                  <div className="edit-row">
                    <input
                      className="form-input"
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(item.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      placeholder="New location"
                      disabled={editSaving}
                      style={{ maxWidth: 220 }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => saveEdit(item.id)}
                      disabled={editSaving}
                    >
                      {editSaving ? <SpinnerIcon /> : <CheckIcon />}
                      {editSaving ? "Saving…" : "Save"}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingId(null)}
                      disabled={editSaving}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="item-location">
                    <span className="location-tag">{item.location}</span>
                  </div>
                )}
              </div>
              {editingId !== item.id && (
                <div className="item-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => startEdit(item)}>
                    <EditIcon /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>
                    <TrashIcon />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
