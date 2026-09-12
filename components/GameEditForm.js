"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVENTORY_FIELDS, STATUS_CHOICES, CURRENT_LOCATION_CHOICES } from "../lib/airtable";
import { patchRecord } from "../lib/clientApi";
import { readWhoFromDocument } from "../lib/whoami";
import PhotoCapture from "./PhotoCapture";
import VoiceTextarea from "./VoiceTextarea";

export default function GameEditForm({ record, locations }) {
  const router = useRouter();
  const f = record.fields;
  const [status, setStatus] = useState(f[INVENTORY_FIELDS.status] || "");
  const [currentLocation, setCurrentLocation] = useState(
    f[INVENTORY_FIELDS.currentLocation] || "Warehouse"
  );
  const [locationIds, setLocationIds] = useState(
    (f[INVENTORY_FIELDS.location] || []).map((v) => (typeof v === "string" ? v : v.id))
  );
  const [notesLog, setNotesLog] = useState(f[INVENTORY_FIELDS.description] || "");
  const [addingNote, setAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const existingPhoto = f[INVENTORY_FIELDS.photo]?.[0]?.url;
  const onRoute = currentLocation === "On Route";

  function appendNote() {
    if (!newNote.trim()) return;
    const stamp = new Date().toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    });
    const entry = `[${stamp}] ${newNote.trim()}`;
    setNotesLog((prev) => (prev ? `${prev}\n${entry}` : entry));
    setNewNote("");
    setAddingNote(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const who = readWhoFromDocument();
      await patchRecord("inventory", record.id, {
        [INVENTORY_FIELDS.status]: status,
        [INVENTORY_FIELDS.currentLocation]: currentLocation,
        [INVENTORY_FIELDS.description]: notesLog,
        [INVENTORY_FIELDS.location]: onRoute ? locationIds : [],
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
      <div style={{ position: "relative" }}>
        <PhotoCapture
          recordId={record.id}
          existingUrl={existingPhoto}
          onUploaded={() => router.refresh()}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 8px",
            minHeight: "auto",
            width: "auto",
            borderRadius: 999,
            border: "1px solid var(--line)",
            background: "var(--paper)",
          }}
        >
          {STATUS_CHOICES.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Current Location</label>
        <select value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)}>
          {CURRENT_LOCATION_CHOICES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {onRoute && (
        <div className="field">
          <label>Which venue?</label>
          <select
            multiple
            value={locationIds}
            onChange={(e) => setLocationIds(Array.from(e.target.selectedOptions, (o) => o.value))}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label>Notes</label>
        {notesLog && (
          <div
            style={{
              whiteSpace: "pre-wrap",
              fontSize: 13.5,
              color: "var(--ink-soft)",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              padding: 12,
              marginBottom: 10,
            }}
          >
            {notesLog}
          </div>
        )}
        {!addingNote && (
          <button
            type="button"
            className="btn secondary"
            style={{ width: "auto", padding: "8px 16px", minHeight: 36, fontSize: 13 }}
            onClick={() => setAddingNote(true)}
          >
            + Add note
          </button>
        )}
        {addingNote && (
          <>
            <VoiceTextarea value={newNote} onChange={setNewNote} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn"
                style={{ width: "auto", padding: "8px 16px", minHeight: 36, fontSize: 13 }}
                onClick={appendNote}
              >
                Save note
              </button>
              <button
                type="button"
                className="btn secondary"
                style={{ width: "auto", padding: "8px 16px", minHeight: 36, fontSize: 13 }}
                onClick={() => { setAddingNote(false); setNewNote(""); }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
      </button>
    </form>
  );
}