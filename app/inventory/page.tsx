"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

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

/* ── Helpers ── */
function formatShortDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
}

function buildLocationLabel(room: string, area: string, spot: string) {
  return [room, area, spot].filter(Boolean).join(" → ");
}

/* ── Icons ── */
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

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function InventoryPage() {
  const router = useRouter();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterRoom, setFilterRoom] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const [rooms, setRooms] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchItems();
    fetch("/api/rooms").then(r => r.json()).then(d => setRooms(d.map((r: { name: string }) => r.name))).catch(() => {});
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.map((c: { name: string }) => c.name))).catch(() => {});
  }, []);

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
    if (!confirm("Delete this item?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      alert("Failed to delete. Please refresh.");
      fetchItems();
    }
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.spot.toLowerCase().includes(q);
      const matchesRoom = filterRoom === "All" || item.room === filterRoom;
      const matchesCategory = filterCategory === "All" || item.category === filterCategory;
      return matchesSearch && matchesRoom && matchesCategory;
    });
  }, [items, search, filterRoom, filterCategory]);

  // Derive rooms and categories that actually appear in the data for filter dropdowns
  const activeRooms = useMemo(() => {
    const set = new Set(items.map((i) => i.room).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  const activeCategories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  const hasActiveFilters = filterRoom !== "All" || filterCategory !== "All";

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Inventory</h1>
        <p>Everything in the household, in one place.</p>
      </header>

      {/* Search + Add row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
        <div className="search-wrapper" style={{ marginBottom: 0, flex: 1 }}>
          <SearchIcon />
          <input
            className="search-input"
            type="search"
            placeholder="Search name, category, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`btn btn-secondary${hasActiveFilters ? " filter-active" : ""}`}
          onClick={() => setShowFilters((v) => !v)}
          style={{ flexShrink: 0 }}
        >
          <FilterIcon />
          Filter
          {hasActiveFilters && <span className="filter-badge" />}
          <ChevronIcon open={showFilters} />
        </button>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/inventory/new")}
          style={{ flexShrink: 0 }}
        >
          <PlusIcon /> Add
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="form-group">
              <label className="form-label">Room</label>
              <select
                className="form-input form-select"
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
              >
                <option value="All">All Rooms</option>
                {activeRooms.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {activeCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setFilterRoom("All"); setFilterCategory("All"); }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
          <div className="empty-state"><SpinnerIcon /><span>Loading inventory…</span></div>
        ) : error ? (
          <div className="empty-state" style={{ color: "var(--rust)" }}>{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <BoxIcon />
            {search || hasActiveFilters
              ? "No items match your search or filters."
              : "No items yet — tap 'Add' to get started."}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="item-card item-card-rich">
              <div className="item-info">
                <div className="item-card-top">
                  <span className="item-name">{item.name}</span>
                  {item.category && (
                    <span className="category-tag">{item.category}</span>
                  )}
                </div>
                {(item.room || item.area || item.spot) && (
                  <div className="item-location">
                    <span className="location-tag">
                      {buildLocationLabel(item.room, item.area, item.spot)}
                    </span>
                  </div>
                )}
                <div className="item-dates">
                  <span>Added {formatShortDate(item.created_at)}</span>
                  {item.updated_at && item.updated_at !== item.created_at && (
                    <span>· Updated {formatShortDate(item.updated_at)}</span>
                  )}
                </div>
              </div>
              <div className="item-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => router.push(`/inventory/${item.id}/edit`)}
                >
                  <EditIcon /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(item.id)}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
