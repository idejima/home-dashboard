"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function BoxBgIcon() {
  return (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="jumbo-card-bg">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    </svg>
  );
}

function CalBgIcon() {
  return (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="jumbo-card-bg">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
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
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Home Dashboard</h1>
        <p>Everything in the household, in one place.</p>
      </header>

      <div className="jumbo-grid">
        {/* Inventory card */}
        <div
          className="jumbo-card inventory"
          onClick={() => router.push("/inventory")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push("/inventory")}
        >
          <div>
            <div className="jumbo-label">Inventory</div>
            <div className="jumbo-count">
              {itemCount === null ? "—" : itemCount}
            </div>
            <div className="jumbo-count-label">
              {itemCount === 1 ? "item tracked" : "items tracked"}
            </div>
          </div>
          <div className="jumbo-arrow">
            <ArrowIcon />
          </div>
        </div>

        {/* Calendar card */}
        <div
          className="jumbo-card calendar"
          onClick={() => router.push("/calendar")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push("/calendar")}
        >
          <div>
            <div className="jumbo-label">Calendar</div>
            <div className="jumbo-count">
              {eventCount === null ? "—" : eventCount}
            </div>
            <div className="jumbo-count-label">
              {eventCount === 1 ? "event scheduled" : "events scheduled"}
            </div>
          </div>
          <div className="jumbo-arrow">
            <ArrowIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
