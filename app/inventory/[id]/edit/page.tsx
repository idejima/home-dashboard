"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  room: string;
  area: string;
  spot: string;
  created_at: string;
  updated_at: string;
}

interface Option { id: number; name: string; }

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
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

function formatShortDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
}

export default function EditInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [room, setRoom] = useState("");
  const [area, setArea] = useState("");
  const [spot, setSpot] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [rooms, setRooms] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [addingRoom, setAddingRoom] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [itemRes, roomsRes, catsRes] = await Promise.all([
          fetch(`/api/items/${id}`),
          fetch("/api/rooms"),
          fetch("/api/categories"),
        ]);
        if (!itemRes.ok) throw new Error("Item not found");
        const item: InventoryItem = await itemRes.json();
        setName(item.name);
        setCategory(item.category ?? "");
        setRoom(item.room ?? "");
        setArea(item.area ?? "");
        setSpot(item.spot ?? "");
        setCreatedAt(item.created_at);
        setUpdatedAt(item.updated_at);
        setRooms(await roomsRes.json());
        setCategories(await catsRes.json());
      } catch {
        setError("Could not load item.");
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [id]);

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

  async function handleSave() {
    if (!name.trim() || saving) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category, room, area, spot }),
      });
      if (!res.ok) throw new Error();
      router.push("/inventory");
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="app-wrapper">
        <div className="empty-state" style={{ marginTop: 80 }}>
          <SpinnerIcon /><span>Loading item…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Edit Item</h1>
        <p>Everything in the household, in one place.</p>
      </header>

      <div className="page-back">
        <button className="btn btn-secondary btn-sm" onClick={() => router.push("/inventory")}>
          <BackIcon /> Back to Inventory
        </button>
      </div>

      {/* Dates */}
      {createdAt && (
        <div className="edit-meta">
          <span>Created {formatShortDate(createdAt)}</span>
          {updatedAt && updatedAt !== createdAt && (
            <span>· Last updated {formatShortDate(updatedAt)}</span>
          )}
        </div>
      )}

      <div className="form-card structured-form">

        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="item-name">Item Name <span className="required">*</span></label>
          <input
            id="item-name"
            className="form-input"
            type="text"
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
