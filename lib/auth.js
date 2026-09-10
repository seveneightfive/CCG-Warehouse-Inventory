// Uses the Web Crypto API (not Node's `crypto` module) so this works in
// both the Edge middleware runtime and normal API routes.

const COOKIE_NAME = "ccg_session";
const SESSION_VALUE = "granted";

async function getKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value) {
  const secret = process.env.SESSION_SECRET || "dev-secret-change-me";
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return `${value}.${toHex(sig)}`;
}

export async function makeSessionCookieValue() {
  return sign(SESSION_VALUE);
}

export async function isSessionValid(cookieValue) {
  if (!cookieValue) return false;
  const [value, hmac] = cookieValue.split(".");
  if (!value || !hmac || value !== SESSION_VALUE) return false;
  const expected = (await sign(value)).split(".")[1];
  return hmac === expected;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

// A single shared shop password, not a per-user secret, so a plain
// comparison is an acceptable tradeoff for simplicity here.
export function checkPassword(candidate) {
  const expected = process.env.APP_PASSWORD || "";
  if (!expected) return false;
  return candidate === expected;
}
