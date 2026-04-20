"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  room: string;
  area: string;
  created_by: number | null;
  creator_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Me {
  id: number;
  role: "admin" | "member";
}

function formatShortDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
}

function buildLocationLabel(room: string, area: string) {
  return [room, area].filter(Boolean).join(" → ");
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
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
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
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
function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <path d="m6 9 6 6 6-6" />
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

  const [items, setItems]     = useState<InventoryItem[]>([]);
  const [me, setMe]           = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [filterRoom, setFilterRoom]         = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showFilters, setShowFilters]       = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [itemsRes, meRes] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/auth/me"),
        ]);
        if (!itemsRes.ok) throw new Error();
        setItems(await itemsRes.json());
        if (meRes.ok) setMe(await meRes.json());
      } catch {
        setError("Could not load inventory. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function canModify(item: InventoryItem): boolean {
    if (!me) return false;
    if (me.role === "admin") return true;
    return item.created_by === me.id;
  }

  async function removeItem(id: number) {
    if (!confirm("Delete this item?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      alert("Failed to delete. Please refresh.");
      fetch("/api/items").then(r => r.json()).then(setItems).catch(() => {});
    }
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(item => {
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q);
      const matchRoom     = filterRoom === "All"     || item.room === filterRoom;
      const matchCategory = filterCategory === "All" || item.category === filterCategory;
      return matchSearch && matchRoom && matchCategory;
    });
  }, [items, search, filterRoom, filterCategory]);

  const activeRooms = useMemo(() =>
    Array.from(new Set(items.map(i => i.room).filter(Boolean))).sort(), [items]);

  const activeCategories = useMemo(() =>
    Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort(), [items]);

  const hasActiveFilters = filterRoom !== "All" || filterCategory !== "All";
  const useGrid = filteredItems.length >= 2;

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Inventory</h1>
        <p>Everything in the household, in one place.</p>
      </header>

      {/* Search + controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
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
          className={`btn btn-secondary btn-sm${hasActiveFilters ? " filter-active" : ""}`}
          onClick={() => setShowFilters(v => !v)}
          style={{ flexShrink: 0, gap: 6 }}
        >
          <FilterIcon />
          Filter
          {hasActiveFilters && <span className="filter-badge" />}
          <ChevronIcon open={showFilters} />
        </button>
        <button
          className="btn btn-primary btn-sm"
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
                {activeRooms.map(r => <option key={r} value={r}>{r}</option>)}
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
                {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
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

      {/* List */}
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
          <div className="empty-state" style={{ color: "#c0392b" }}>{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <BoxIcon />
            {search || hasActiveFilters
              ? "No items match your search or filters."
              : "No items yet — tap 'Add' to get started."}
          </div>
        ) : (
          <div className={useGrid ? "item-grid" : undefined}>
            {filteredItems.map(item => {
              const allowed = canModify(item);
              const locationLabel = buildLocationLabel(item.room, item.area);
              const isMine = item.created_by === me?.id;

              return (
                <div key={item.id} className="item-card">
                  <div className="item-info">
                    <div className="item-card-top">
                      <span className="item-name">{item.name}</span>
                      {item.category && <span className="category-tag">{item.category}</span>}
                    </div>

                    {locationLabel && (
                      <div className="item-location">
                        <span className="location-tag">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {locationLabel}
                        </span>
                      </div>
                    )}

                    <div className="item-dates">
                      {item.creator_name && (
                        <span className="item-creator">
                          {isMine ? "You" : item.creator_name}
                        </span>
                      )}
                      {item.creator_name && <span className="item-dates-sep">·</span>}
                      <span>Added {formatShortDate(item.created_at)}</span>
                      {item.updated_at && item.updated_at !== item.created_at && (
                        <span>· Updated {formatShortDate(item.updated_at)}</span>
                      )}
                    </div>
                  </div>

                  {allowed && (
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
