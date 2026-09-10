"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PrintControls({ recordIds }) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(false);

  async function markPrinted() {
    setMarking(true);
    try {
      await fetch("/api/inventory/mark-printed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordIds }),
      });
      setDone(true);
      router.refresh();
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="printControls">
      <button type="button" className="btn" onClick={() => window.print()}>
        Print this sheet
      </button>
      <button
        type="button"
        className="btn secondary"
        onClick={markPrinted}
        disabled={marking || done}
      >
        {done ? "Marked as printed" : marking ? "Saving…" : "Mark sheet as printed"}
      </button>
      <a href="/labels" className="btn secondary">
        Back to labels
      </a>
    </div>
  );
}
