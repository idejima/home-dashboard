"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";

/* ── Icons ── */
function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
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

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}

function PlusBoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8"  x2="8"  y1="2" y2="6" />
      <line x1="3"  x2="21" y1="10" y2="10" />
    </svg>
  );
}

/* ── Nav items ── */
const NAV = [
  { label: "Home",             href: "/",              Icon: HomeIcon },
  { label: "Inventory",        href: "/inventory",     Icon: BoxIcon },
  { label: "Add Inventory",    href: "/inventory/new", Icon: PlusBoxIcon },
  { label: "Calendar",         href: "/calendar",      Icon: CalIcon },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <title>Home Dashboard</title>
      </head>
      <body>
        {/* Hamburger trigger */}
        <button
          className="hamburger"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <HamburgerIcon />
        </button>

        {/* Overlay */}
        <div
          className={`sidebar-overlay${open ? " open" : ""}`}
          onClick={() => setOpen(false)}
        />

        {/* Sidebar */}
        <nav className={`sidebar${open ? " open" : ""}`}>
          <div className="sidebar-top">
            <span className="sidebar-logo">Home Dashboard</span>
            <button
              className="sidebar-close"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="sidebar-nav">
            {NAV.map(({ label, href, Icon }) => (
              <button
                key={href}
                className={`sidebar-link${pathname === href ? " active" : ""}`}
                onClick={() => navigate(href)}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            Everything in the household
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
