"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function safeText(v) {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object" && "name" in v) return String(v.name);
  return "";
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        const records = (data.records || []).filter((r) => !r.fields.Placeholder);
        setAllRecords(records);
      })
      .finally(() => setLoading(false));
  }, []);

  const results = query.trim()
    ? allRecords.filter((r) => {
        const f = r.fields;
        const haystack = `${safeText(f.Title)} ${safeText(f.SKU)}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : [];

  return (
    <div className="content">
      <input
        autoFocus
        placeholder="Search inventory..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: "8px",
          border: "1.5px solid var(--line)",
          marginTop: "16px",
          marginBottom: "16px",
          fontSize: "16px",
          background: "var(--paper)",
          color: "var(--ink)",
        }}
      />
      {loading && <div className="emptyState">Loading…</div>}
      {!loading && query && results.length === 0 && (
        <div className="emptyState">No matches for "{query}"</div>
      )}
      {results.map((r) => (
        <Link key={r.id} href={`/game/${r.id}`} className="card">
          <div className="sku">{safeText(r.fields.SKU)}</div>
          <div className="title">{safeText(r.fields.Title)}</div>
        </Link>
      ))}
    </div>
  );
}