"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WORK_ORDER_FIELDS } from "../lib/airtable";
import { createWorkOrder } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";
import VoiceTextarea from "./VoiceTextarea";

export default function NewWorkOrderForm({ games, staff, parts, isBoss }) {
  const router = useRouter();
  const [gameId, setGameId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [notes, setNotes] = useState("");
  const [partIds, setPartIds] = useState([]);
  const [flagged, setFlagged] = useState(isBoss);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [who, setWho] = useState(null);

  useEffect(() => {
    const me = readWhoFromDocument();
    setWho(me);
    if (me) {
      const match = staff.find((s) => s.id === me.id);
      if (match) setStaffId(match.id);
    }
  }, [staff]);

  function togglePart(id) {
    setPartIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!gameId) {
      setError("Pick which game this is about.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { record } = await createWorkOrder({
        [WORK_ORDER_FIELDS.inventoryLink]: [gameId],
        [WORK_ORDER_FIELDS.staff]: staffId ? [staffId] : [],
        [WORK_ORDER_FIELDS.notes]: notes,
        [WORK_ORDER_FIELDS.partsUsed]: partIds,
        [WORK_ORDER_FIELDS.status]: "Just Assigned",
        [WORK_ORDER_FIELDS.flaggedByBoss]: flagged,
        [WORK_ORDER_FIELDS.lastUpdatedBy]: who?.name || "",
      });
      router.push(`/wo/${record.id}`);
    } catch (err) {
      setError("Couldn't save. Try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Which game</label>
        <select value={gameId} onChange={(e) => setGameId(e.target.value)}>
          <option value="">Select a game…</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}{g.sku ? ` — ${g.sku}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Assign to (optional)</label>
        <select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
          <option value="">Unassigned</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>What needs to happen</label>
        <VoiceTextarea value={notes} onChange={setNotes} placeholder="e.g. Check the marquee light, might be a bad ballast" />
      </div>

      <div className="field">
        <label>Parts used (optional)</label>
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
                onChange={() => togglePart(p.id)}
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

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          fontSize: 14,
        }}
      >
        <input
          type="checkbox"
          checked={flagged}
          onChange={(e) => setFlagged(e.target.checked)}
          style={{ width: 20, height: 20 }}
        />
        Flag as a boss request (shows on the front page)
      </label>

      {error && <p className="error">{error}</p>}

      <button
        className={`btn ${flagged ? "flag" : ""}`}
        type="submit"
        disabled={saving}
      >
        {saving ? "Saving…" : flagged ? "Save & flag it" : "Save work order"}
      </button>
    </form>
  );
}
