"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WORK_ORDER_FIELDS, WORK_ORDER_STATUS_CHOICES } from "../lib/airtable";
import { patchRecord } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";

export default function WorkOrderEditForm({ record }) {
  const router = useRouter();
  const f = record.fields;
  const [status, setStatus] = useState(f[WORK_ORDER_FIELDS.status] || "");
  const [notes, setNotes] = useState(f[WORK_ORDER_FIELDS.notes] || "");
  const [laborHours, setLaborHours] = useState(
    f[WORK_ORDER_FIELDS.laborHours] ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const who = readWhoFromDocument();
      await patchRecord("workorders", record.id, {
        [WORK_ORDER_FIELDS.status]: status,
        [WORK_ORDER_FIELDS.notes]: notes,
        [WORK_ORDER_FIELDS.laborHours]: laborHours
          ? Number(laborHours)
          : undefined,
        [WORK_ORDER_FIELDS.lastUpdatedBy]: who?.name || "",
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
      <div className="field">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {WORK_ORDER_STATUS_CHOICES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Notes of work</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="field">
        <label>Labor hours</label>
        <input
          type="number"
          step="0.25"
          value={laborHours}
          onChange={(e) => setLaborHours(e.target.value)}
        />
      </div>

      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
      </button>
    </form>
  );
}
