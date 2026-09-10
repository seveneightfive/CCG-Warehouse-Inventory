"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WORK_ORDER_FIELDS, WORK_ORDER_STATUS_CHOICES } from "../lib/airtable";
import { patchRecord } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";
import VoiceTextarea from "./VoiceTextarea";

export default function WorkOrderEditForm({ record }) {
  const router = useRouter();
  const f = record.fields;
  const [status, setStatus] = useState(f[WORK_ORDER_FIELDS.status] || "");
  const [notes, setNotes] = useState(f[WORK_ORDER_FIELDS.notes] || "");
  const [laborHours, setLaborHours] = useState(
    f[WORK_ORDER_FIELDS.laborHours] ?? ""
  );
  const [billToConsignor, setBillToConsignor] = useState(
    !!f[WORK_ORDER_FIELDS.billToConsignor]
  );
  const [billAmount, setBillAmount] = useState(
    f[WORK_ORDER_FIELDS.billAmount] ?? ""
  );
  const [billedConfirmed, setBilledConfirmed] = useState(
    !!f[WORK_ORDER_FIELDS.billedConfirmed]
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isComplete = status === "Complete";

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
        [WORK_ORDER_FIELDS.billToConsignor]: billToConsignor,
        [WORK_ORDER_FIELDS.billAmount]: billAmount ? Number(billAmount) : undefined,
        [WORK_ORDER_FIELDS.billedConfirmed]: billedConfirmed,
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
        <VoiceTextarea value={notes} onChange={setNotes} />
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

      {isComplete && (
        <div
          style={{
            border: "1.5px solid var(--flag)",
            background: "#fffaf0",
            borderRadius: "var(--radius)",
            padding: 14,
            marginBottom: 18,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <input
              type="checkbox"
              checked={billToConsignor}
              onChange={(e) => setBillToConsignor(e.target.checked)}
              style={{ width: 20, height: 20 }}
            />
            Bill this against the consignor
          </label>

          {billToConsignor && (
            <>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Amount to bill</label>
                <input
                  type="number"
                  step="0.01"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                />
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <input
                  type="checkbox"
                  checked={billedConfirmed}
                  onChange={(e) => setBilledConfirmed(e.target.checked)}
                  style={{ width: 20, height: 20 }}
                />
                Confirmed billed (done at auction time)
              </label>
            </>
          )}
        </div>
      )}

      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
      </button>
    </form>
  );
}
