"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function WhoAmIForm({ staff }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);

  async function choose(person) {
    setSaving(true);
    await fetch("/api/whoami", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: person.id, name: person.name }),
    });
    const next = searchParams.get("next") || "/dashboard";
    router.push(next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {staff.map((person) => (
        <button
          key={person.id}
          type="button"
          className="btn secondary"
          disabled={saving}
          onClick={() => choose(person)}
          style={{ fontSize: 17 }}
        >
          {person.name}
        </button>
      ))}
    </div>
  );
}
