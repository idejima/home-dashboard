"use client";

import { useState, useEffect } from "react";

interface Option { id: number; name: string; }
interface User {
  id: number;
  name: string;
  username: string;
  role: "admin" | "member";
  created_at: string;
}
interface Me { id: number; role: string; }

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
function UsersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

/* ── List manager (categories / rooms) ── */
function ListManager({
  items, onAdd, onRename, onDelete, placeholder, addLabel,
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
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!newName.trim() || adding}>
          {adding ? <SpinnerIcon /> : <PlusIcon />}
          {adding ? "Adding…" : addLabel}
        </button>
      </div>
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
                  <button className="btn btn-primary btn-sm" onClick={() => handleRename(item.id)} disabled={!editName.trim() || savingId === item.id}>
                    {savingId === item.id ? <SpinnerIcon /> : <CheckIcon />}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)} disabled={savingId === item.id}>
                    <XIcon />
                  </button>
                </div>
              ) : (
                <>
                  <span className="admin-item-name">{item.name}</span>
                  <div className="admin-item-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditingId(item.id); setEditName(item.name); }}>
                      <EditIcon /> Rename
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}>
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

/* ── Create User Modal ── */
function CreateUserModal({ onCreated, onClose }: { onCreated: (u: User) => void; onClose: () => void }) {
  const [name, setName]         = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<"member" | "admin">("member");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  async function handleCreate() {
    if (!name.trim() || !username.trim() || !password || saving) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), password, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create user");
        return;
      }
      const created = await res.json();
      onCreated(created);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-title">Create User</span>
          <button className="modal-close" onClick={onClose}><CloseIcon /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input className="form-input" type="text" placeholder="e.g. Jake" value={name} onChange={e => setName(e.target.value)} disabled={saving} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" placeholder="e.g. jake" value={username} onChange={e => setUsername(e.target.value)} disabled={saving} autoCapitalize="none" autoCorrect="off" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={saving} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input form-select" value={role} onChange={e => setRole(e.target.value as "member" | "admin")} disabled={saving}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: 12 }}>{error}</p>}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={!name.trim() || !username.trim() || !password || saving}>
            {saving ? <SpinnerIcon /> : <PlusIcon />}
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Users Manager ── */
function UsersManager({ me }: { me: Me }) {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editRole, setEditRole]     = useState<"member" | "admin">("member");
  const [savingId, setSavingId]     = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(id: number) {
    if (savingId === id) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole }),
      });
      if (!res.ok) { alert("Failed to update role."); return; }
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: updated.role } : u));
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) { alert("Failed to delete user."); return; }
      setUsers(prev => prev.filter(u => u.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  if (loading) {
    return <div className="empty-state"><SpinnerIcon /><span>Loading users…</span></div>;
  }

  return (
    <div className="admin-list-manager">
      {showCreate && (
        <CreateUserModal
          onCreated={(u) => {
            setUsers(prev => [...prev, u]);
            setShowCreate(false);
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      <div className="admin-add-row">
        <div style={{ flex: 1, color: "var(--ink-muted)", fontSize: "0.9rem" }}>
          {users.length} user{users.length !== 1 ? "s" : ""} registered
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <PlusIcon /> Create User
        </button>
      </div>

      {users.length === 0 ? (
        <div className="admin-empty">No users yet.</div>
      ) : (
        <ul className="admin-list">
          {users.map(user => (
            <li key={user.id} className="admin-list-item admin-user-item">
              <div className="admin-user-info">
                <div className="admin-user-name">
                  {user.name}
                  {user.id === me.id && <span className="you-badge">you</span>}
                </div>
                <div className="admin-user-meta">
                  @{user.username} · joined {formatDate(user.created_at)}
                </div>
              </div>

              {editingId === user.id ? (
                <div className="admin-edit-row" style={{ flex: "none" }}>
                  <select
                    className="form-input form-select admin-edit-input"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as "member" | "admin")}
                    disabled={savingId === user.id}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={() => handleRoleChange(user.id)} disabled={savingId === user.id}>
                    {savingId === user.id ? <SpinnerIcon /> : <CheckIcon />}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                    <XIcon />
                  </button>
                </div>
              ) : (
                <div className="admin-item-actions">
                  <span className={`role-badge role-${user.role}`}>{user.role}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setEditingId(user.id); setEditRole(user.role); }}
                  >
                    <EditIcon /> Role
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(user.id, user.username)}
                    disabled={deletingId === user.id}
                  >
                    {deletingId === user.id ? <SpinnerIcon /> : <TrashIcon />}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Page ── */
type Tab = "users" | "categories" | "rooms";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [me, setMe]   = useState<Me | null>(null);

  const [categories, setCategories] = useState<Option[]>([]);
  const [rooms, setRooms]           = useState<Option[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [meRes, cRes, rRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/categories"),
          fetch("/api/rooms"),
        ]);
        setMe(await meRes.json());
        setCategories(await cRes.json());
        setRooms(await rRes.json());
      } catch {
        setError("Could not load data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function addCategory(name: string) {
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const added = await res.json();
    setCategories(prev => prev.find(c => c.id === added.id) ? prev : [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
  }
  async function renameCategory(id: number, newName: string) {
    const res = await fetch(`/api/categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) });
    if (!res.ok) { alert("Failed to rename."); return; }
    const updated = await res.json();
    setCategories(prev => prev.map(c => c.id === id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)));
  }
  async function deleteCategory(id: number) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Failed to delete."); return; }
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  async function addRoom(name: string) {
    const res = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const added = await res.json();
    setRooms(prev => prev.find(r => r.id === added.id) ? prev : [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
  }
  async function renameRoom(id: number, newName: string) {
    const res = await fetch(`/api/rooms/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) });
    if (!res.ok) { alert("Failed to rename."); return; }
    const updated = await res.json();
    setRooms(prev => prev.map(r => r.id === id ? updated : r).sort((a, b) => a.name.localeCompare(b.name)));
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
        <p>Users, categories, and rooms.</p>
      </header>

      <div className="admin-tabs">
        <button className={`admin-tab${tab === "users" ? " active" : ""}`} onClick={() => setTab("users")}>
          <UsersIcon /> Users
        </button>
        <button className={`admin-tab${tab === "categories" ? " active" : ""}`} onClick={() => setTab("categories")}>
          <TagIcon /> Categories
        </button>
        <button className={`admin-tab${tab === "rooms" ? " active" : ""}`} onClick={() => setTab("rooms")}>
          <MapPinIcon /> Rooms
        </button>
      </div>

      {loading ? (
        <div className="empty-state" style={{ marginTop: 32 }}><SpinnerIcon /><span>Loading…</span></div>
      ) : error ? (
        <div className="empty-state" style={{ color: "#c0392b", marginTop: 32 }}>{error}</div>
      ) : tab === "users" && me ? (
        <UsersManager me={me} />
      ) : tab === "categories" ? (
        <ListManager items={categories} onAdd={addCategory} onRename={renameCategory} onDelete={deleteCategory} placeholder="e.g. Garden" addLabel="Add Category" />
      ) : (
        <ListManager items={rooms} onAdd={addRoom} onRename={renameRoom} onDelete={deleteRoom} placeholder="e.g. Guest Room" addLabel="Add Room" />
      )}
    </div>
  );
}
