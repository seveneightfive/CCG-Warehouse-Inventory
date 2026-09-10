export const WHOAMI_COOKIE = "ccg_who";

// Not httpOnly on purpose: client components read this directly to
// pre-fill "assigned to" and stamp "Last Updated By" without an extra
// round trip. It's a display convenience, not a security boundary —
// the password cookie is what actually gates access.

export function parseWhoCookie(value) {
  if (!value) return null;
  try {
    const decoded = JSON.parse(decodeURIComponent(value));
    if (decoded && decoded.id && decoded.name) return decoded;
  } catch {
    return null;
  }
  return null;
}

export function readWhoFromDocument() {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${WHOAMI_COOKIE}=`));
  if (!match) return null;
  return parseWhoCookie(match.split("=").slice(1).join("="));
}
