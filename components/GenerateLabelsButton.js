"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateLabelsButton({ prefix, consignorId, count = 30 }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleClick() {
    setSaving(true);
    try {
      await fetch("/api/inventory/placeholders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix, consignorId, count }),
      });
      router.push(`/labels/print/${prefix}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      className="btn secondary"
      onClick={handleClick}
      disabled={saving}
      style={{ marginTop: 8 }}
    >
      {saving ? "Creating…" : `Generate next ${count} labels`}
    </button>
  );
}
