"use client";

import { useState, useEffect, useMemo } from "react";

/* ── Types ── */
interface InventoryItem {
  id: number;
  name: string;
  location: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
}

/* ── Helpers ── */
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
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
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

function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ════════════════════════════════════
   Main Page
════════════════════════════════════ */
export default function HomePage() {
  /* ── Inventory state ── */
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemLocation, setItemLocation] = useState("");
  const [itemAdding, setItemAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLocation, setEditLocation] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  /* ── Calendar state ── */
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventAdding, setEventAdding] = useState(false);

  /* ── Search state ── */
  const [search, setSearch] = useState("");

  /* ── Load on mount ── */
  useEffect(() => {
    fetchItems();
    fetchEvents();
  }, []);

  /* ── API: Items ── */
  async function fetchItems() {
    setItemsLoading(true);
    setItemsError("");
    try {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error("Failed to load items");
      setItems(await res.json());
    } catch {
      setItemsError("Could not load inventory. Please refresh.");
    } finally {
      setItemsLoading(false);
    }
  }

  async function addItem() {
    const name = itemName.trim();
    const location = itemLocation.trim();
    if (!name || !location || itemAdding) return;
    setItemAdding(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location }),
      });
      if (!res.ok) throw new Error();
      const newItem = await res.json();
      setItems((prev) => [...prev, newItem]);
      setItemName("");
      setItemLocation("");
    } catch {
      alert("Failed to add item. Please try again.");
    } finally {
      setItemAdding(false);
    }
  }

  async function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      alert("Failed to delete item. Please refresh.");
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

  function cancelEdit() {
    setEditingId(null);
  }

  /* ── API: Events ── */
  async function fetchEvents() {
    setEventsLoading(true);
    setEventsError("");
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to load events");
      setEvents(await res.json());
    } catch {
      setEventsError("Could not load events. Please refresh.");
    } finally {
      setEventsLoading(false);
    }
  }

  async function addEvent() {
    const title = eventTitle.trim();
    if (!title || !eventDate || eventAdding) return;
    setEventAdding(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date: eventDate }),
      });
      if (!res.ok) throw new Error();
      const newEvent = await res.json();
      setEvents((prev) => [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
      setEventTitle("");
      setEventDate("");
    } catch {
      alert("Failed to add event. Please try again.");
    } finally {
      setEventAdding(false);
    }
  }

  async function removeEvent(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      alert("Failed to delete event. Please refresh.");
      fetchEvents();
    }
  }

  /* ── Derived ── */
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  /* ── Render ── */
  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <h1>Home Dashboard</h1>
        <p>Everything in your household, in one place.</p>
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
          {!itemsLoading && (
            <span className="section-count">
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
            </span>
          )}
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
                disabled={itemAdding}
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
                disabled={itemAdding}
              />
            </div>
          </div>
          <button
            className="btn btn-primary btn-full"
            onClick={addItem}
            disabled={itemAdding}
          >
            {itemAdding ? <SpinnerIcon /> : <PlusIcon />}
            {itemAdding ? "Adding…" : "Add Item"}
          </button>
        </div>

        {/* Item List */}
        {itemsLoading ? (
          <div className="empty-state">
            <SpinnerIcon />
            <span style={{ marginTop: 12, display: "block" }}>Loading inventory…</span>
          </div>
        ) : itemsError ? (
          <div className="empty-state" style={{ color: "var(--rust)" }}>
            {itemsError}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <BoxIcon />
            {search
              ? `No items matching "${search}"`
              : "No items yet — add your first one above."}
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
                      onClick={cancelEdit}
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

      <hr className="section-divider" />

      {/* ── Calendar Section ── */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Calendar</h2>
          {!eventsLoading && (
            <span className="section-count">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </span>
          )}
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
                disabled={eventAdding}
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
                disabled={eventAdding}
              />
            </div>
          </div>
          <button
            className="btn btn-primary btn-full"
            onClick={addEvent}
            disabled={eventAdding}
          >
            {eventAdding ? <SpinnerIcon /> : <PlusIcon />}
            {eventAdding ? "Adding…" : "Add Event"}
          </button>
        </div>

        {/* Event List */}
        {eventsLoading ? (
          <div className="empty-state">
            <SpinnerIcon />
            <span style={{ marginTop: 12, display: "block" }}>Loading events…</span>
          </div>
        ) : eventsError ? (
          <div className="empty-state" style={{ color: "var(--rust)" }}>
            {eventsError}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <CalIcon />
            No events yet — add your first one above.
          </div>
        ) : (
          events.map((event) => {
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
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeEvent(event.id)}
                  >
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
