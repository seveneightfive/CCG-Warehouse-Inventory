"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVENTORY_FIELDS, BRAND_CHOICES } from "../lib/airtable";
import { patchRecord } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";

export default function InspectionForm({ record }) {
  const router = useRouter();
  const f = record.fields;

  const existingBrand = f[INVENTORY_FIELDS.brand] || "";
  const isKnownBrand = !existingBrand || BRAND_CHOICES.includes(existingBrand);

  const [condition, setCondition] = useState(f[INVENTORY_FIELDS.condition] || "Used");
  const [dedicated, setDedicated] = useState(!!f[INVENTORY_FIELDS.dedicatedCabinet]);
  const [conditionNotes, setConditionNotes] = useState(
    f[INVENTORY_FIELDS.conditionNotes] || ""
  );
  const [brandChoice, setBrandChoice] = useState(
    isKnownBrand ? existingBrand || "" : "__other__"
  );
  const [customBrand, setCustomBrand] = useState(isKnownBrand ? "" : existingBrand);
  const [serialNumber, setSerialNumber] = useState(f[INVENTORY_FIELDS.serialNumber] || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const finalBrand = brandChoice === "__other__" ? customBrand.trim() : brandChoice;
    if (!finalBrand) {
      setError("Pick or type a brand / manufacturer.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const who = readWhoFromDocument();
      await patchRecord("inventory", record.id, {
        [INVENTORY_FIELDS.condition]: condition,
        [INVENTORY_FIELDS.dedicatedCabinet]: dedicated,
        [INVENTORY_FIELDS.conditionNotes]: conditionNotes,
        [INVENTORY_FIELDS.brand]: finalBrand,
        [INVENTORY_FIELDS.serialNumber]: serialNumber,
        [INVENTORY_FIELDS.inspectionComplete]: true,
        [INVENTORY_FIELDS.lastUpdatedBy]: who?.name || "",
      });
      router.push(`/game/${record.id}`);
    } catch {
      setError("Couldn't save. Try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Condition</label>
        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="New">New</option>
          <option value="Used">Used</option>
        </select>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
          fontSize: 15,
        }}
      >
        <input
          type="checkbox"
          checked={dedicated}
          onChange={(e) => setDedicated(e.target.checked)}
          style={{ width: 20, height: 20 }}
        />
        Dedicated cabinet
      </label>

      <div className="field">
        <label>Brand / manufacturer</label>
        <select
          value={brandChoice}
          onChange={(e) => setBrandChoice(e.target.value)}
        >
          <option value="">Select…</option>
          {BRAND_CHOICES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
          <option value="__other__">Not listed — type it in</option>
        </select>
      </div>

      {brandChoice === "__other__" && (
        <div className="field">
          <label>New brand name</label>
          <input
            value={customBrand}
            onChange={(e) => setCustomBrand(e.target.value)}
            placeholder="Type the manufacturer name"
            autoFocus
          />
        </div>
      )}

      <div className="field">
        <label>Serial #</label>
        <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
      </div>

      <div className="field">
        <label>Condition notes</label>
        <textarea
          value={conditionNotes}
          onChange={(e) => setConditionNotes(e.target.value)}
          placeholder="Wear, missing parts, anything worth flagging"
        />
      </div>

      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Complete inspection"}
      </button>
    </form>
  );
}
