"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVENTORY_FIELDS } from "../lib/airtable";
import { patchRecord } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";
import VoiceTextarea from "./VoiceTextarea";

export default function InspectionForm({ record, brandChoices }) {
  const router = useRouter();
  const f = record.fields;

  const existingBrand = f[INVENTORY_FIELDS.brand] || "";
  const isKnownBrand = !existingBrand || brandChoices.includes(existingBrand);

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
  const [outcome, setOutcome] = useState(f[INVENTORY_FIELDS.inspectionOutcome] || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const finalBrand = brandChoice === "__other__" ? customBrand.trim() : brandChoice;
    if (!finalBrand) {
      setError("Pick or type a brand / manufacturer.");
      return;
    }
    if (!outcome) {
      setError("Pick an outcome before finishing.");
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
        [INVENTORY_FIELDS.inspectionOutcome]: outcome,
        [INVENTORY_FIELDS.lastUpdatedBy]: who?.name || "",
      });
      router.push("/board");
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
          {brandChoices.map((b) => (
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
        <VoiceTextarea value={conditionNotes} onChange={setConditionNotes} placeholder="Wear, missing parts, anything worth flagging" />
      </div>

      <div className="field">
        <label>Outcome</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={() => setOutcome("Needs Attention")}
            className="btn"
            style={{
              background: outcome === "Needs Attention" ? "#C0392B" : "var(--surface)",
              color: outcome === "Needs Attention" ? "#fff" : "var(--ink)",
              border: "1.5px solid #C0392B",
            }}
          >
            Needs attention
          </button>
          <button
            type="button"
            onClick={() => setOutcome("Ready to Clean & Photograph")}
            className="btn"
            style={{
              background: outcome === "Ready to Clean & Photograph" ? "#2F8F5B" : "var(--surface)",
              color: outcome === "Ready to Clean & Photograph" ? "#fff" : "var(--ink)",
              border: "1.5px solid #2F8F5B",
            }}
          >
            Ready to be cleaned and photographed
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Complete inspection"}
      </button>
    </form>
  );
}
