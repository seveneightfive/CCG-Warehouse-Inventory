"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVENTORY_FIELDS, SOURCE_TYPE_CHOICES } from "../lib/airtable";
import { createGame, createCustomer, uploadGamePhoto } from "../lib/clientApi";
import PhotoCapture from "./PhotoCapture";

const today = () => new Date().toISOString().slice(0, 10);

export default function NewGameForm({ consignors, customers }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("Consignment");
  const [consignorId, setConsignorId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [purchasedFrom, setPurchasedFrom] = useState("");
  const [dateReceived, setDateReceived] = useState(today());
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Inline "add a new customer" state
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [customerList, setCustomerList] = useState(customers);
  const [savingCustomer, setSavingCustomer] = useState(false);

  async function handleAddCustomer() {
    if (!newCustomerName.trim()) return;
    setSavingCustomer(true);
    try {
      const { record } = await createCustomer({
        Name: newCustomerName,
        "Phone Number": newCustomerPhone,
      });
      const added = { id: record.id, name: newCustomerName };
      setCustomerList((prev) => [...prev, added]);
      setCustomerId(record.id);
      setAddingCustomer(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
    } catch {
      setError("Couldn't add that customer. Try again.");
    } finally {
      setSavingCustomer(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (sourceType === "Consignment" && !consignorId) {
      setError("Pick a consignor.");
      return;
    }
    if (sourceType === "Customer Repair" && !customerId) {
      setError("Pick or add a customer.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { record } = await createGame({
        title,
        sourceType,
        consignorId: sourceType === "Consignment" ? consignorId : undefined,
        customerId: sourceType === "Customer Repair" ? customerId : undefined,
        purchasedFrom: sourceType === "In-House Purchase" ? purchasedFrom : undefined,
        dateReceived,
        description,
      });
      if (photoFile) {
        try {
          await uploadGamePhoto(record.id, photoFile);
        } catch {
          // record is saved either way; photo can be retried from the detail page
        }
      }
      router.push(`/game/${record.id}`);
    } catch (err) {
      setError("Couldn't save. Check the details and try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PhotoCapture onUploaded={(file) => setPhotoFile(file)} />

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
        <label>Source</label>
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
        >
          {SOURCE_TYPE_CHOICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {sourceType === "Consignment" && (
        <div className="field">
          <label>Consignor</label>
          <select
            value={consignorId}
            onChange={(e) => setConsignorId(e.target.value)}
          >
            <option value="">Select a consignor…</option>
            {consignors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {sourceType === "In-House Purchase" && (
        <div className="field">
          <label>Purchased from</label>
          <input
            value={purchasedFrom}
            onChange={(e) => setPurchasedFrom(e.target.value)}
            placeholder="e.g. an auction house or seller name"
          />
        </div>
      )}

      {sourceType === "Customer Repair" && (
        <div className="field">
          <label>Customer</label>
          {!addingCustomer ? (
            <>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Select a customer…</option>
                {customerList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn secondary"
                style={{ marginTop: 8 }}
                onClick={() => setAddingCustomer(true)}
              >
                + Add a new customer
              </button>
            </>
          ) : (
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: 12,
              }}
            >
              <div className="field">
                <label>Customer name</label>
                <input
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="field" style={{ marginBottom: 10 }}>
                <label>Phone (optional)</label>
                <input
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={handleAddCustomer}
                  disabled={savingCustomer}
                >
                  {savingCustomer ? "Adding…" : "Add customer"}
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setAddingCustomer(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
