"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STATUS_CHOICES } from "../lib/airtable";
import { patchRecord } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";

export default function InventoryCard({
  id,
  sku,
  title,
  thumbUrl,
  status,
  statusColorHex,
  outcome,
  outcomeColorHex,
  consignorLine,
  locationLine,
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleStatusChange(e) {
    const next = e.target.value;
    setCurrentStatus(next);
    setSaving(true);
    try {
      const who = readWhoFromDocument();
      await patchRecord("inventory", id, {
        Status: next,
        "Last Updated By": who?.name || "",
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="card"
      style={{ borderLeftColor: outcomeColorHex || statusColorHex }}
    >
      <Link href={`/game/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div className="row">
          <img src={thumbUrl || "/capital-icon.png"} alt="" className="thumb" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sku">{sku || "no sku"}</div>
            <div className="title">{title || "(untitled)"}</div>
            <div className="meta">
              {consignorLine && <span>{consignorLine}</span>}
              {locationLine && <span>{locationLine}</span>}
            </div>
          </div>
        </div>
      </Link>

      <div
        className="meta"
        style={{ marginTop: 10, alignItems: "center", justifyContent: "space-between" }}
      >
        {outcome && (
          <span
            className="statusPill"
            style={{ background: outcomeColorHex, color: "#fff" }}
          >
            {outcome}
          </span>
        )}
        <span
          className="quickStatus"
          onClick={(e) => e.stopPropagation()}
          style={{ marginLeft: "auto" }}
        >
          <select value={currentStatus} onChange={handleStatusChange} disabled={saving}>
            {STATUS_CHOICES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </span>
      </div>
    </div>
  );
}
