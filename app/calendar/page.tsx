"use client";

import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
}

function formatDate(dateStr: string): { month: string; day: string; full: string } {
  if (!dateStr) return { month: "", day: "", full: "" };
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return {
    month: d.toLocaleString("en", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
    full: d.toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  };
}

function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
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

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error();
      setEvents(await res.json());
    } catch {
      setError("Could not load events. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  async function addEvent() {
    const trimTitle = title.trim();
    if (!trimTitle || !date) {
      setFormError("Both title and date are required.");
      return;
    }
    setAdding(true);
    setFormError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimTitle, date }),
      });
      if (!res.ok) throw new Error();
      const newEvent = await res.json();
      setEvents((prev) =>
        [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date))
      );
      setTitle("");
      setDate("");
    } catch {
      setFormError("Failed to add event. Please try again.");
    } finally {
      setAdding(false);
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

  return (
    <PageShell>
      <header className="page-header">
        <div className="page-header-top">
          <h1 className="page-title">Calendar</h1>
        </div>
        <p className="page-subtitle">Upcoming household events and reminders.</p>
      </header>

      {/* Add Event Form */}
      <div className="form-card">
        {formError && <div className="form-error">{formError}</div>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="event-title">Event Title</label>
            <input
              id="event-title"
              className="form-input"
              type="text"
              placeholder="e.g. Doctor appointment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEvent()}
              disabled={adding}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="event-date">Date</label>
            <input
              id="event-date"
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={adding}
            />
          </div>
        </div>
        <button className="btn btn-primary btn-full" onClick={addEvent} disabled={adding}>
          {adding ? <SpinnerIcon /> : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
          {adding ? "Adding…" : "Add Event"}
        </button>
      </div>

      {/* Count */}
      {!loading && !error && (
        <div className="list-meta">
          <span className="section-count">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Event List */}
      {loading ? (
        <div className="empty-state"><SpinnerIcon /><span style={{ marginTop: 12, display: "block" }}>Loading…</span></div>
      ) : error ? (
        <div className="empty-state" style={{ color: "var(--rust)" }}>{error}</div>
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
                <button className="btn btn-danger btn-sm" onClick={() => removeEvent(event.id)}>
                  <TrashIcon
