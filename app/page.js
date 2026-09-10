"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Wrong password. Try again.");
        setLoading(false);
        return;
      }
      const next = searchParams.get("next") || "/dashboard";
      router.push(`/who?next=${encodeURIComponent(next)}`);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="loginWrap">
      <img
        className="loginLogo"
        src="/CapitalIcon-White.png"
        alt="Capital City Games & Music"
      />
      <h1>Capital City Games & Music Inventory</h1>
      <p>Enter the shop password to open the app.</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Checking…" : "Open the app"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
