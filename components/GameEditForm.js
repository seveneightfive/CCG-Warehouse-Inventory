"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVENTORY_FIELDS, STATUS_CHOICES } from "../lib/airtable";
import { patchRecord } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";
import PhotoCapture from "./PhotoCapture";
import VoiceTextarea from "./VoiceTextarea";

export default function GameEditForm({ record, locations }) {
  const router = useRouter();
  const f = record.fields;
  const [status, setStatus] = useState(f[INVENTORY_FIELDS.status] || "");
  const [locationIds, setLocationIds] = useState(
    (f[INVENTORY_FIELDS.location] || []).map((v) =>
      typeof v === "string" ? v : v.id
    )
  );
  const [description, setDescription] = useState(
    f[INVENTORY_FIELDS.description] || ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const existingPhoto = f[INVENTORY_FIELDS.photo]?.[0]?.url;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const who = readWhoFromDocument();
      await patchRecord("inventory", record.id, {
        [INVENTORY_FIELDS.status]: status,
        [INVENTORY_FIELDS.description]: description,
        [INVENTORY_FIELDS.location]: locationIds,
        [INVENTORY_FIELDS.lastUpdatedBy]: who?.name || "",
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <PhotoCapture
        recordId={record.id}
        existingUrl={existingPhoto}
        onUploaded={() => router.refresh()}
      />

      <div className="field">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_CHOICES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Location (if on route / at a venue)</label>
        <select
          multiple
          value={locationIds}
          onChange={(e) =>
            setLocationIds(
              Array.from(e.target.selectedOptions, (o) => o.value)
            )
          }
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Notes / Description</label>
        <VoiceTextarea value={description} onChange={setDescription} />
      </div>

      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
      </button>
    </form>
  );
}
