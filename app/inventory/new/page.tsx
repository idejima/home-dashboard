"use client";

import { useState, useEffect } from "react";
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

interface Option { id: number; name: string; }

export default function NewInventoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [room, setRoom] = useState("");
  const [area, setArea] = useState("");
  const [spot, setSpot] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [rooms, setRooms] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [addingRoom, setAddingRoom] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    fetch("/api/rooms").then(r => r.json()).then(setRooms).catch(() => {});
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  async function handleAddRoom() {
    const trimmed = newRoom.trim();
    if (!trimmed) return;
    setAddingRoom(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const added = await res.json();
      setRooms((prev) => {
        const exists = prev.find((r) => r.id === added.id);
        return exists ? prev : [...prev, added].sort((a, b) => a.name.localeCompare(b.name));
      });
      setRoom(added.name);
      setNewRoom("");
    } catch { /* silent */ } finally {
      setAddingRoom(false);
    }
  }

  async function handleAddCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setAddingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const added = await res.json();
      setCategories((prev) => {
        const exists = prev.find((c) => c.id === added.id);
        return exists ? prev : [...prev, added].sort((a, b) => a.name.localeCompare(b.name));
      });
      setCategory(added.name);
      setNewCategory("");
    } catch { /* silent */ } finally {
      setAddingCategory(false);
    }
  }

  async function handleSubmit() {
    const trimName = name.trim();
    if (!trimName || saving) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimName, category, room, area, spot }),
      });
      if (!res.ok) throw new Error();
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
        <button className="btn btn-secondary btn-sm" onClick={() => router.push("/inventory")}>
          <BackIcon /> Back to Inventory
        </button>
      </div>

      <div className="form-card structured-form">

        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="item-name">Item Name <span className="required">*</span></label>
          <input
            id="item-name"
            className="form-input"
            type="text"
            placeholder="e.g. Extension cord"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            autoFocus
          />
        </div>

        <div className="form-divider" />

        {/* Category */}
        <div className="form-section-label">Category</div>
        <div className="form-group">
          <label className="form-label" htmlFor="category">Select Category</label>
          <select
            id="category"
            className="form-input form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={saving}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="inline-add-row">
          <input
            className="form-input"
            type="text"
            placeholder="Add new category…"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            disabled={addingCategory || saving}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleAddCategory}
            disabled={!newCategory.trim() || addingCategory}
          >
            {addingCategory ? <SpinnerIcon /> : "+ Add"}
          </button>
        </div>

        <div className="form-divider" />

        {/* Location */}
        <div className="form-section-label">Location</div>

        <div className="form-group">
          <label className="form-label" htmlFor="room">Room</label>
          <select
            id="room"
            className="form-input form-select"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            disabled={saving}
          >
            <option value="">— Select Room —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="inline-add-row">
          <input
            className="form-input"
            type="text"
            placeholder="Add new room…"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddRoom()}
            disabled={addingRoom || saving}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleAddRoom}
            disabled={!newRoom.trim() || addingRoom}
          >
            {addingRoom ? <SpinnerIcon /> : "+ Add"}
          </button>
        </div>

        <div className="form-row" style={{ marginTop: 14 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="area">Area</label>
            <input
              id="area"
              className="form-input"
              type="text"
              placeholder="e.g. TV Console"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="spot">Spot</label>
            <input
              id="spot"
              className="form-input"
              type="text"
              placeholder="e.g. Bottom Drawer"
              value={spot}
              onChange={(e) => setSpot(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        {/* Location preview */}
        {(room || area || spot) && (
          <div className="location-preview">
            <span className="location-preview-label">Location:</span>
            <span className="location-tag">
              {[room, area, spot].filter(Boolean).join(" → ")}
            </span>
          </div>
        )}

        {error && (
          <p style={{ color: "var(--rust)", fontSize: "0.85rem", marginTop: 12 }}>{error}</p>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
        >
          {saving ? <SpinnerIcon /> : <PlusIcon />}
          {saving ? "Saving…" : "Add Item"}
        </button>
      </div>
    </div>
  );
}
