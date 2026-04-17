"use client";

import { useState, useEffect } from "react";

interface Option { id: number; name: string; }

/* ── Icons ── */
function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.3-7.3a1 1 0 0 0 0-1.41L12 2z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* ── Generic list manager ── */
function ListManager({
  items,
  onAdd,
  onRename,
  onDelete,
  placeholder,
  addLabel,
}: {
  items: Option[];
  onAdd: (name: string) => Promise<void>;
  onRename: (id: number, newName: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  placeholder: string;
  addLabel: string;
}) {
  const [newName, setNewName]       = useState("");
  const [adding, setAdding]         = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editName, setEditName]     = useState("");
  const [savingId, setSavingId]     = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleAdd() {
    if (!newName.trim() || adding) return;
    setAdding(true);
    await onAdd(newName.trim());
    setNewName("");
    setAdding(false);
  }

  async function handleRename(id: number) {
    if (!editName.trim() || savingId === id) return;
    setSavingId(id);
    await onRename(id, editName.trim());
    setSavingId(null);
    setEditingId(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this item? Items using it will keep their existing value.")) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  return (
    <div className="admin-list-manager">
      {/* Add row */}
      <div className="admin-add-row">
        <input
          className="form-input"
          type="text"
          placeholder={placeholder}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={adding}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={handleAdd}
          disabled={!newName.trim() || adding}
        >
          {adding ? <SpinnerIcon /> : <PlusIcon />}
          {adding ? "Adding…" : addLabel}
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="admin-empty">No items yet.</div>
      ) : (
        <ul className="admin-list">
          {items.map(item => (
            <li key={item.id} className="admin-list-item">
              {editingId === item.id ? (
                <div className="admin-edit-row">
                  <input
                    className="form-input admin-edit-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(item.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    disabled={savingId === item.id}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleRename(item.id)}
                    disabled={!editName.trim() || savingId === item.id}
                  >
                    {savingId === item.id ? <SpinnerIcon /> : <CheckIcon />}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingId(null)}
                    disabled={savingId === item.id}
                  >
                    <XIcon />
                  </button>
                </div>
              ) : (
                <>
                  <span className="admin-item-name">{item.name}</span>
                  <div className="admin-item-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setEditingId(item.id); setEditName(item.name); }}
                    >
                      <EditIcon /> Rename
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? <SpinnerIcon /> : <TrashIcon />}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Page ── */
type Tab = "categories" | "rooms";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("categories");

  const [categories, setCategories] = useState<Option[]>([]);
  const [rooms, setRooms]           = useState<Option[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cRes, rRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/rooms"),
        ]);
        setCategories(await cRes.json());
        setRooms(await rRes.json());
      } catch {
        setError("Could not load data. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── Categories CRUD ── */
  async function addCategory(name: string) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const added = await res.json();
    setCategories(prev =>
      prev.find(c => c.id === added.id)
        ? prev
        : [...prev, added].sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  async function renameCategory(id: number, newName: string) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (!res.ok) { alert("Failed to rename."); return; }
    const updated = await res.json();
    setCategories(prev =>
      prev.map(c => c.id === id ? updated : c)
          .sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  async function deleteCategory(id: number) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Failed to delete."); return; }
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  /* ── Rooms CRUD ── */
  async function addRoom(name: string) {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const added = await res.json();
    setRooms(prev =>
      prev.find(r => r.id === added.id)
        ? prev
        : [...prev, added].sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  async function renameRoom(id: number, newName: string) {
    const res = await fetch(`/api/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (!res.ok) { alert("Failed to rename."); return; }
    const updated = await res.json();
    setRooms(prev =>
      prev.map(r => r.id === id ? updated : r)
          .sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  async function deleteRoom(id: number) {
    const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Failed to delete."); return; }
    setRooms(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Manage Lists</h1>
        <p>Add, rename or remove categories and rooms.</p>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === "categories" ? " active" : ""}`}
          onClick={() => setTab("categories")}
        >
          <TagIcon /> Categories
        </button>
        <button
          className={`admin-tab${tab === "rooms" ? " active" : ""}`}
          onClick={() => setTab("rooms")}
        >
          <MapPinIcon /> Rooms
        </button>
      </div>

      {loading ? (
        <div className="empty-state" style={{ marginTop: 32 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>Loading…</span>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ color: "#c0392b", marginTop: 32 }}>{error}</div>
      ) : tab === "categories" ? (
        <ListManager
          items={categories}
          onAdd={addCategory}
          onRename={renameCategory}
          onDelete={deleteCategory}
          placeholder="e.g. Garden"
          addLabel="Add Category"
        />
      ) : (
        <ListManager
          items={rooms}
          onAdd={addRoom}
          onRename={renameRoom}
          onDelete={deleteRoom}
          placeholder="e.g. Guest Room"
          addLabel="Add Room"
        />
      )}
    </div>
  );
}
