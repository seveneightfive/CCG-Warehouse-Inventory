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
    <div className="field">
      <label>Photo</label>
      {preview && (
        <img
          src={preview}
          alt="Game photo"
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: "var(--radius)",
            marginBottom: 10,
            border: "1px solid var(--line)",
          }}
        />
      )}
      <button
        type="button"
        className="btn secondary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading…" : preview ? "Retake photo" : "Take photo"}
      </button>
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
