// Airtable lookups-of-links can come back as nested arrays. Flatten to a
// clean list of display strings regardless of shape.
export function flattenToStrings(value) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.flatMap((v) => flattenToStrings(v));
  }
  if (typeof value === "object") {
    return [value.name || value.id || JSON.stringify(value)];
  }
  return [String(value)];
}

export function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
