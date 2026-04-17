"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [itemCount, setItemCount]   = useState<number | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/items")
      .then(r => r.json())
      .then(d => setItemCount(Array.isArray(d) ? d.length : 0))
      .catch(() => setItemCount(0));
    fetch("/api/events")
      .then(r => r.json())
      .then(d => setEventCount(Array.isArray(d) ? d.length : 0))
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
          className="jumbo-card"
          onClick={() => router.push("/inventory")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push("/inventory")}
        >
          {/* Decorative bg shape — purely visual, behind everything */}
          <svg
            aria-hidden="true"
            width="110"
            height="110"
            viewBox="0 0 24 24"
            fill="currentColor"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: "absolute",
              top: 10,
              right: -20,
              color: "var(--blue)",
              opacity: 0.05,
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          </svg>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="jumbo-label">Inventory</div>
            <div className="jumbo-count">{itemCount === null ? "—" : itemCount}</div>
            <div className="jumbo-count-label">
              {itemCount === 1 ? "item tracked" : "items tracked"}
            </div>
          </div>
          <div className="jumbo-arrow" style={{ position: "relative", zIndex: 1 }}>
            <ArrowIcon />
          </div>
        </div>

        {/* Calendar card */}
        <div
          className="jumbo-card"
          onClick={() => router.push("/calendar")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push("/calendar")}
        >
          <svg
            aria-hidden="true"
            width="110"
            height="110"
            viewBox="0 0 24 24"
            fill="currentColor"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: "absolute",
              top: 10,
              right: -20,
              color: "var(--blue)",
              opacity: 0.05,
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <path d="M7 2v2M17 2v2M3 8h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" />
          </svg>
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <rect x="3" y="10" width="18" height="12" rx="0" />
          </svg>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="jumbo-label">Calendar</div>
            <div className="jumbo-count">{eventCount === null ? "—" : eventCount}</div>
            <div className="jumbo-count-label">
              {eventCount === 1 ? "event scheduled" : "events scheduled"}
            </div>
          </div>
          <div className="jumbo-arrow" style={{ position: "relative", zIndex: 1 }}>
            <ArrowIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
