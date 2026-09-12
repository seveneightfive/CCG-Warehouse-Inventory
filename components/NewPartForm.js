"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PART_CATEGORY_CHOICES } from "../lib/airtable";
import LocationCodePicker from "./LocationCodePicker";

export default function NewPartForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(PART_CATEGORY_CHOICES[0]);
  const [description, setDescription] = useState("");
  const [purchasedAmount, setPurchasedAmount] = useState("1");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchasedFrom, setPurchasedFrom] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "Part Name": name,
          "Part Category": category,
          "Item Description": description,
          "Purchased Amount": purchasedAmount ? Number(purchasedAmount) : undefined,
          "Purchase Price": purchasePrice ? Number(purchasePrice) : undefined,
          "Purchased From": purchasedFrom,
          Location: location,
          "Ordered Date": new Date().toISOString().slice(0, 10),
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/parts");
    } catch {
      setError("Couldn't save. Try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Part name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
      </div>
      <div className="field">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {PART_CATEGORY_CHOICES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="field">
        <label>Quantity purchased</label>
        <input type="number" value={purchasedAmount} onChange={(e) => setPurchasedAmount(e.target.value)} />
      </div>
      <div className="field">
        <label>Total purchase price</label>
        <input type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
      </div>
      <div className="field">
        <label>Purchased from</label>
        <input value={purchasedFrom} onChange={(e) => setPurchasedFrom(e.target.value)} />
      </div>
            <div className="field">
        <label>Storage location</label>
        <LocationCodePicker value={location} onChange={setLocation} />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Add part"}
      </button>
    </form>
  );
}
