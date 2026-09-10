"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patchRecord } from "../lib/clientApi";
import { INVENTORY_FIELDS } from "../lib/airtable";

export default function PrintSheetControls({ recordId, alreadyPrinted }) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);

  async function handlePrint() {
    window.print();
    if (!alreadyPrinted) {
      setMarking(true);
      try {
        await patchRecord("inventory", recordId, {
          [INVENTORY_FIELDS.detailsSheetPrinted]: true,
        });
        router.refresh();
      } finally {
        setMarking(false);
      }
    }
  }

  return (
    <div className="printControls">
      <button type="button" className="btn" onClick={handlePrint} disabled={marking}>
        {marking ? "Saving…" : "Print this sheet"}
      </button>
      <a href={`/game/${recordId}`} className="btn secondary">
        Back to game
      </a>
    </div>
  );
}
