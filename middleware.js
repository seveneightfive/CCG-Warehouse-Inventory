import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, isSessionValid } from "./lib/auth";
import { WHOAMI_COOKIE } from "./lib/whoami";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublic) return NextResponse.next();

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await isSessionValid(cookie);
  if (!valid) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const isWhoRoute = pathname === "/who" || pathname.startsWith("/api/whoami");
  const who = request.cookies.get(WHOAMI_COOKIE)?.value;
  if (!isWhoRoute && !who) {
    const url = request.nextUrl.clone();
    url.pathname = "/who";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
