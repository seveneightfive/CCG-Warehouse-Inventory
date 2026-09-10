"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", padding: 24 }}>
        <h1>Something broke</h1>
        <p>{error?.message || "Unknown error"}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
