"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVENTORY_FIELDS, SOURCE_TYPE_CHOICES } from "../lib/airtable";
import { patchRecord } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";
import PhotoCapture from "./PhotoCapture";

const today = () => new Date().toISOString().slice(0, 10);

export default function QuickFillForm({ record, ownerLabel }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateReceived, setDateReceived] = useState(today());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Enter the game's title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const who = readWhoFromDocument();
      await patchRecord("inventory", record.id, {
        [INVENTORY_FIELDS.title]: title,
        [INVENTORY_FIELDS.description]: description,
        [INVENTORY_FIELDS.dateReceived]: dateReceived,
        [INVENTORY_FIELDS.placeholder]: false,
        [INVENTORY_FIELDS.lastUpdatedBy]: who?.name || "",
      });
      router.refresh();
    } catch {
      setError("Couldn't save. Try again.");
      setSaving(false);
    }
  }

  return (
    <div>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          padding: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>
          You're labeling
        </div>
        <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 22 }}>
          {ownerLabel} — Label #{record.fields[INVENTORY_FIELDS.labelNumber]}
        </div>
      </div>

      <PhotoCapture recordId={record.id} onUploaded={() => router.refresh()} />

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Game title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label>Date received</label>
          <input
            type="date"
            value={dateReceived}
            onChange={(e) => setDateReceived(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Notes (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Confirm & save"}
        </button>
      </form>
    </div>
  );
}
