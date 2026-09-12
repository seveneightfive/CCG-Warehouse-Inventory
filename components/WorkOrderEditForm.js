"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WORK_ORDER_FIELDS, WORK_ORDER_STATUS_CHOICES } from "../lib/airtable";
import { patchRecord } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";
import VoiceTextarea from "./VoiceTextarea";

const LABOR_RATE = 30;
const PARTS_MARKUP = 1.2;

export default function WorkOrderEditForm({ record, parts }) {
  const router = useRouter();
  const f = record.fields;
  const [status, setStatus] = useState(f[WORK_ORDER_FIELDS.status] || "");
  const [notes, setNotes] = useState(f[WORK_ORDER_FIELDS.notes] || "");
  const [laborHours, setLaborHours] = useState(
    f[WORK_ORDER_FIELDS.laborHours] ?? ""
  );
  const [partIds, setPartIds] = useState(
    (f[WORK_ORDER_FIELDS.partsUsed] || []).map((v) =>
      typeof v === "string" ? v : v.id
    )
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

  const estimate = useMemo(() => {
    const laborCost = (Number(laborHours) || 0) * LABOR_RATE;
    const partsCost = parts
      .filter((p) => partIds.includes(p.id))
      .reduce((sum, p) => sum + (Number(p.pricePerItem) || 0) * PARTS_MARKUP, 0);
    return { laborCost, partsCost, total: laborCost + partsCost };
  }, [laborHours, partIds, parts]);

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
        [WORK_ORDER_FIELDS.partsUsed]: partIds,
        [WORK_ORDER_FIELDS.billToConsignor]: billToConsignor,
        [WORK_ORDER_FIELDS.billAmount]: billAmount ? Number(billAmount) : undefined,
        [WORK_ORDER_FIELDS.billedConfirmed]: billedConfirmed,
        [WORK_ORDER_FIELDS.lastUpdatedBy]: who?.name || "",
      });
      setSaved(true);
      router.push("/work-orders");
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

      <div className="field">
        <label>Parts used</label>
        <div
          style={{
            border: "1.5px solid var(--line)",
            borderRadius: "var(--radius)",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {parts.length === 0 && (
            <div style={{ padding: 12, fontSize: 13, color: "var(--ink-soft)" }}>
              No parts on file yet.
            </div>
          )}
          {parts.map((p) => (
            <label
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderBottom: "1px solid var(--line)",
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={partIds.includes(p.id)}
                onChange={() =>
                  setPartIds((prev) =>
                    prev.includes(p.id)
                      ? prev.filter((x) => x !== p.id)
                      : [...prev, p.id]
                  )
                }
                style={{ width: 18, height: 18 }}
              />
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 12, color: p.inStock <= 2 ? "#C0392B" : "var(--ink-soft)" }}>
                {p.inStock} in stock
              </span>
            </label>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          padding: "12px 14px",
          marginBottom: 18,
          fontSize: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span>Labor ({laborHours || 0} hrs × $30)</span>
          <span>${estimate.laborCost.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span>Parts (+20%)</span>
          <span>${estimate.partsCost.toFixed(2)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            borderTop: "1px solid var(--line)",
            paddingTop: 6,
          }}
        >
          <span>Estimated total</span>
          <span>${estimate.total.toFixed(2)}</span>
        </div>
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
                  value={billAmount || estimate.total.toFixed(2)}
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