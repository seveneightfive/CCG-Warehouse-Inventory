import Link from "next/link";
import { cookies } from "next/headers";
import { WHOAMI_COOKIE, parseWhoCookie } from "../lib/whoami";

export default function TopBar({ title, backHref, backLabel = "Back" }) {
  const who = parseWhoCookie(cookies().get(WHOAMI_COOKIE)?.value);

  return (
    <div className="topbar">
      {backHref ? (
        <Link className="back" href={backHref}>
          ‹ {backLabel}
        </Link>
      ) : (
        <span />
      )}
      <span className="screenTitle">{title || ""}</span>
      {who ? (
        <Link href="/who" className="back" style={{ fontWeight: 500 }}>
          {who.name}
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
