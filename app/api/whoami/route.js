import { NextResponse } from "next/server";
import { WHOAMI_COOKIE } from "../../../lib/whoami";

export async function POST(request) {
  const { id, name } = await request.json();
  if (!id || !name) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    WHOAMI_COOKIE,
    encodeURIComponent(JSON.stringify({ id, name })),
    {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    }
  );
  return res;
}
