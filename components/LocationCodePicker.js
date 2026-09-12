"use client";
import { useState, useEffect } from "react";

function generateBays(count) {
  const letters = [];
  for (let i = 0; i < Math.min(count, 26); i++) {
    letters.push(String.fromCharCode(65 + i)); // A–Z
  }
  for (let i = 26; i < count; i++) {
    const l = String.fromCharCode(65 + (i - 26));
    letters.push(l + l); // AA, BB, CC, DD...
  }
  return letters;
}

const BAYS = generateBays(30);
const SHELVES = [1, 2, 3, 4, 5];
const BINS = Array.from({ length: 9 }, (_, i) => String(i + 1).padStart(2, "0"));

export default function LocationCodePicker({ value, onChange }) {
  const parts = (value || "").split("-");
  const [bay, setBay] = useState(parts[0] || BAYS[0]);
  const [shelf, setShelf] = useState(parts[1] || String(SHELVES[0]));
  const [bin, setBin] = useState(parts[2] || BINS[0]);

  useEffect(() => {
    onChange(`${bay}-${shelf}-${bin}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bay, shelf, bin]);

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select value={bay} onChange={(e) => setBay(e.target.value)} style={{ flex: 1 }}>
        {BAYS.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
      <select value={shelf} onChange={(e) => setShelf(e.target.value)} style={{ flex: 1 }}>
        {SHELVES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select value={bin} onChange={(e) => setBin(e.target.value)} style={{ flex: 1 }}>
        {BINS.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}