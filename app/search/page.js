"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => setAllRecords(data.records || []))
      .finally(() => setLoading(false));
  }, []);

  const results = query.trim()
    ? allRecords.filter((r) => {
        const f = r.fields;
        const haystack = `${f.Title || ""} ${f.SKU || ""}`.toLowerCase();
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
          <div className="sku">{r.fields.SKU}</div>
          <div className="title">{r.fields.Title}</div>
        </Link>
      ))}
    </div>
  );
}