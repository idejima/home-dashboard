"use client";

import { useState, useMemo } from "react";

/* ── Types ── */
interface InventoryItem {
  id: string;
  name: string;
  location: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
}

/* ── Helpers ── */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatDate(dateStr: string): { month: string; day: string; full: string } {
  if (!dateStr) return { month: "", day: "", full: "" };
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return {
    month: d.toLocaleString("en", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
    full: d.toLocaleDateString("en", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

/* ── Icons ── */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
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

function BoxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
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

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
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

/* ════════════════════════════════════
   Main Page
════════════════════════════════════ */
export default function HomePage() {
  /* ── Inventory state ── */
  const [items, setItems] = useState<InventoryItem[]>([
    { id: uid(), name: "Spare batteries", location: "Kitchen drawer" },
    { id: uid(), name: "First-aid kit", location: "Bathroom cabinet" },
  ]);
  const [itemName, setItemName] = useState("");
  const [itemLocation, setItemLocation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState("");

  /* ── Calendar state ── */
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: uid(), title: "Pay rent", date: "2026-05-01" },
    { id: uid(), title: "Service car", date: "2026-04-20" },
  ]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");

  /* ── Search state ── */
  const [search, setSearch] = useState("");

  /* ── Derived ── */
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  );

  /* ── Inventory handlers ── */
  function addItem() {
    const name = itemName.trim();
    const location = itemLocation.trim();
    if (!name || !location) return;
    setItems((prev) => [...prev, { id: uid(), name, location }]);
    setItemName("");
    setItemLocation("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function startEdit(item: InventoryItem) {
    setEditingId(item.id);
    setEditLocation(item.location);
  }

  function saveEdit(id: string) {
    const loc = editLocation.trim();
    if (!loc) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, location: loc } : i)));
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  /* ── Calendar handlers ── */
  function addEvent() {
    const title = eventTitle.trim();
    if (!title || !eventDate) return;
    setEvents((prev) => [...prev, { id: uid(), title, date: eventDate }]);
    setEventTitle("");
    setEventDate("");
  }

  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  /* ── Render ── */
  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <h1>Home Dashboard</h1>
        <p>Everything your household needs, in one place.</p>
      </header>

      {/* Search */}
      <div className="search-wrapper">
        <SearchIcon />
        <input
          className="search-input"
          type="search"
          placeholder="Search inventory by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Inventory Section ── */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Inventory</h2>
          <span className="section-count">{filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Add Item Form */}
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="item-name">Item Name</label>
              <input
                id="item-name"
                className="form-input"
                type="text"
                placeholder="e.g. Spare keys"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="item-location">Location</label>
              <input
                id="item-location"
                className="form-input"
                type="text"
                placeholder="e.g. Hall cupboard"
                value={itemLocation}
                onChange={(e) => setItemLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={addItem}>
            <PlusIcon /> Add Item
          </button>
        </div>

        {/* Item List */}
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <BoxIcon />
            {search ? `No items matching "${search}"` : "No items yet. Add one above."}
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
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                      placeholder="New location"
                      style={{ maxWidth: 220 }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(item.id)}>
                      <CheckIcon /> Save
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
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

      <hr className="section-divider" />

      {/* ── Calendar Section ── */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Calendar</h2>
          <span className="section-count">{events.length} event{events.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Add Event Form */}
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="event-title">Event Title</label>
              <input
                id="event-title"
                className="form-input"
                type="text"
                placeholder="e.g. Doctor appointment"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEvent()}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="event-date">Date</label>
              <input
                id="event-date"
                className="form-input"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={addEvent}>
            <PlusIcon /> Add Event
          </button>
        </div>

        {/* Event List */}
        {sortedEvents.length === 0 ? (
          <div className="empty-state">
            <CalIcon />
            No events yet. Add one above.
          </div>
        ) : (
          sortedEvents.map((event) => {
            const { month, day, full } = formatDate(event.date);
            return (
              <div key={event.id} className="event-card">
                <div className="event-date-block">
                  <span className="event-date-month">{month}</span>
                  <span className="event-date-day">{day}</span>
                </div>
                <div className="event-info">
                  <div className="event-title">{event.title}</div>
                  <div className="event-date-full">{full}</div>
                </div>
                <div className="event-remove">
                  <button className="btn btn-danger btn-sm" onClick={() => removeEvent(event.id)}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
