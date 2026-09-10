"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVENTORY_FIELDS } from "../lib/airtable";
import { createGame } from "../lib/clientApi";

const today = () => new Date().toISOString().slice(0, 10);

export default function NewGameForm({ consignors }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [consignorId, setConsignorId] = useState("");
  const [labelNumber, setLabelNumber] = useState("");
  const [dateReceived, setDateReceived] = useState(today());
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { record } = await createGame({
        [INVENTORY_FIELDS.title]: title,
        [INVENTORY_FIELDS.consignor]: consignorId ? [consignorId] : [],
        [INVENTORY_FIELDS.labelNumber]: labelNumber
          ? Number(labelNumber)
          : undefined,
        [INVENTORY_FIELDS.dateReceived]: dateReceived,
        [INVENTORY_FIELDS.description]: description,
        [INVENTORY_FIELDS.status]: "Just Received",
      });
      router.push(`/game/${record.id}`);
    } catch (err) {
      setError("Couldn't save. Check the label number and try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Game title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div className="field">
        <label>Consignor (leave blank for in-house / CCG)</label>
        <select
          value={consignorId}
          onChange={(e) => setConsignorId(e.target.value)}
        >
          <option value="">CCG (in-house)</option>
          {consignors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Label # (from the sticker you're putting on it)</label>
        <input
          type="number"
          value={labelNumber}
          onChange={(e) => setLabelNumber(e.target.value)}
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
        <label>Description / notes</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Add to inventory"}
      </button>
    </form>
  );
}
