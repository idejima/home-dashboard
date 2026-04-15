"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "./components/PageShell";

export default function HomePage() {
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((data) => setItemCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setItemCount(0));

    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEventCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setEventCount(0));
  }, []);

  return (
    <PageShell>
      <header className="app-header">
        <h1>Home Dashboard</h1>
        <p>Everything in the household, in one place.</p>
      </header>

      <div className="jumbotron-grid">
        {/* Inventory jumbotron */}
        <Link href="/inventory" className="jumbotron jumbotron--inventory">
          <div className="jumbotron-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
          </div>
          <div className="jumbotron-label">Inventory</div>
          <div className="jumbotron-count">
            {itemCount === null ? (
              <span className="jumbotron-loading">…</span>
            ) : (
              <>
                <span className="jumbotron-count-number">{itemCount}</span>
                <span className="jumbotron-count-unit">item{itemCount !== 1 ? "s" : ""}</span>
              </>
            )}
          </div>
          <div className="jumbotron-cta">View all →</div>
        </Link>

        {/* Calendar jumbotron */}
        <Link href="/calendar" className="jumbotron jumbotron--calendar">
          <div className="jumbotron-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
          <div className="jumbotron-label">Calendar</div>
          <div className="jumbotron-count">
            {eventCount === null ? (
              <span className="jumbotron-loading">…</span>
            ) : (
              <>
                <span className="jumbotron-count-number">{eventCount}</span>
                <span className="jumbotron-count-unit">event{eventCount !== 1 ? "s" : ""}</span>
              </>
            )}
          </div>
          <div className="jumbotron-cta">View all →</div>
        </Link>
      </div>
    </PageShell>
  );
}
