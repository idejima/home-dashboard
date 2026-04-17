"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Option { id: number; name: string; }

function SpinnerIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function AddNewModal({
  title,
  placeholder,
  onSave,
  onClose,
}: {
  title: string;
  placeholder: string;
  onSave: (value: string) => Promise<void>;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!value.trim() || saving) return;
    setSaving(true);
    await onSave(value.trim());
    setSaving(false);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="form-input"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!value.trim() || saving}>
            {saving ? <SpinnerIcon /> : <PlusIcon />}
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewInventoryPage() {
  const router = useRouter();

  const [name, setName]         = useState("");
  const [category, setCategory] = useState("");
  const [room, setRoom]         = useState("");
  const [area, setArea]         = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const [rooms, setRooms]           = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [modal, setModal]           = useState<"room" | "category" | null>(null);

  useEffect(() => {
    fetch("/api/rooms").then(r => r.json()).then(setRooms).catch(() => {});
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  async function handleAddRoom(value: string) {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value }),
    });
    const added = await res.json();
    setRooms(prev => {
      const exists = prev.find(r => r.id === added.id);
      return exists ? prev : [...prev, added].sort((a, b) => a.name.localeCompare(b.name));
    });
    setRoom(added.name);
    setModal(null);
  }

  async function handleAddCategory(value: string) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value }),
    });
    const added = await res.json();
    setCategories(prev => {
      const exists = prev.find(c => c.id === added.id);
      return exists ? prev : [...prev, added].sort((a, b) => a.name.localeCompare(b.name));
    });
    setCategory(added.name);
    setModal(null);
  }

  async function handleSubmit() {
    if (!name.trim() || saving) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category, room, area }),
      });
      if (!res.ok) throw new Error();
      router.push("/inventory");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <>
      {modal === "room" && (
        <AddNewModal
          title="Add New Room"
          placeholder="e.g. Guest Room"
          onSave={handleAddRoom}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "category" && (
        <AddNewModal
          title="Add New Category"
          placeholder="e.g. Garden"
          onSave={handleAddCategory}
          onClose={() => setModal(null)}
        />
      )}

      <div className="app-wrapper">
        <header className="app-header">
          <h1>Add Item</h1>
        </header>

        <div className="page-back">
          <button className="btn btn-secondary btn-sm" onClick={() => router.push("/inventory")}>
            <BackIcon /> Back to Inventory
          </button>
        </div>

        <div className="form-card structured-form">

          {/* Item Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="item-name">
              Item Name <span className="required">*</span>
            </label>
            <input
              id="item-name"
              className="form-input"
              type="text"
              placeholder="e.g. Extension cord"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={saving}
              autoFocus
            />
          </div>

          <div className="form-divider" />

          {/* Category */}
          <div className="form-group">
            <div className="field-group-header">
              <label className="form-label" htmlFor="category">Category</label>
              <button className="add-new-trigger" onClick={() => setModal("category")} type="button">
                <PlusIcon /> Add new
              </button>
            </div>
            <select
              id="category"
              className="form-input form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={saving}
            >
              <option value="">— None —</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-divider" />

          {/* Location */}
          <div className="form-group">
            <div className="field-group-header">
              <label className="form-label" htmlFor="room">Room</label>
              <button className="add-new-trigger" onClick={() => setModal("room")} type="button">
                <PlusIcon /> Add new
              </button>
            </div>
            <select
              id="room"
              className="form-input form-select"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              disabled={saving}
            >
              <option value="">— Select Room —</option>
              {rooms.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="area">
              Area
              <span className="form-label-hint">(optional — e.g. TV Console)</span>
            </label>
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

          {error && (
            <p style={{ color: "#c0392b", fontSize: "0.85rem" }}>{error}</p>
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
    </>
  );
}
