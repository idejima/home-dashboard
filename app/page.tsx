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
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="jumbo-label">Inventory</div>
            <div className="jumbo-count">{itemCount === null ? "—" : itemCount}</div>
            <div className="jumbo-count-label">
              {itemCount === 1 ? "item tracked" : "items tracked"}
            </div>
          </div>
          <div className="jumbo-arrow" style={{ position: "relative", zIndex: 1 }}/>
        </div>

        {/* Calendar card */}
        <div
          className="jumbo-card"
          onClick={() => router.push("/calendar")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push("/calendar")}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="jumbo-label">Calendar</div>
            <div className="jumbo-count">{eventCount === null ? "—" : eventCount}</div>
            <div className="jumbo-count-label">
              {eventCount === 1 ? "event scheduled" : "events scheduled"}
            </div>
          </div>
          <div className="jumbo-arrow" style={{ position: "relative", zIndex: 1 }}/>
        </div>
      </div>
    </div>
  );
}
