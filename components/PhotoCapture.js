"use client";

import { useRef, useState } from "react";
import { uploadGamePhoto } from "../lib/clientApi";

export default function PhotoCapture({ recordId, existingUrl, onUploaded }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(existingUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    try {
      if (recordId) {
        await uploadGamePhoto(recordId, file);
        if (onUploaded) onUploaded();
      } else if (onUploaded) {
        // no record yet — hand the raw file up to the parent form
        onUploaded(file);
      }
    } catch {
      setError("Photo didn't upload. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="field" style={{ position: "relative" }}>
      {preview ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={preview}
            alt="Game photo"
            style={{
              width: 160,
              height: 160,
              objectFit: "cover",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              display: "block",
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              position: "absolute",
              bottom: 6,
              right: 6,
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 9px",
              borderRadius: 999,
              border: "none",
              background: "rgba(16,19,28,0.75)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {uploading ? "…" : "Retake"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ width: "auto", padding: "0 16px" }}
        >
          {uploading ? "Uploading…" : "Take photo"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
