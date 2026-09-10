import { NextResponse } from "next/server";
import {
  checkPassword,
  makeSessionCookieValue,
  SESSION_COOKIE_NAME,
} from "../../../lib/auth";

export async function POST(request) {
  const { password } = await request.json();

  if (!password || !checkPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, await makeSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
