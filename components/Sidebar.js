"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: "/board",
    label: "Inventory",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" />
        <path d="M3 8l9 5 9-5M12 13v8" />
      </svg>
    ),
  },
  {
    href: "/parts",
    label: "Parts",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 01-4 0v-.09A1.7 1.7 0 009 19.4a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.55-1H3a2 2 0 010-4h.09A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.55V3a2 2 0 014 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 9a1.7 1.7 0 001.55 1H21a2 2 0 010 4h-.09a1.7 1.7 0 00-1.55 1z" />
      </svg>
    ),
  },
  {
    href: "/work-orders",
    label: "Work Orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 2h6v3H9zM8 9h8M8 13h8M8 17h5" />
      </svg>
    ),
  },
    {
    href: "/consignors",
    label: "Consignors",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: "/more",
    label: "More",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
      </svg>
    ),
  },
];

const HIDDEN_ON = ["/", "/who"];

export default function Sidebar() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <nav className="sidebar">
      <div className="sidebarLogo">
        <img src="/CapitalIcon-White.png" alt="" style={{ height: 22, width: "auto" }} />
        Capital City
      </div>
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} className={active ? "active" : ""}>
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}