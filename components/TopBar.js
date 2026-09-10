import Link from "next/link";
import { cookies } from "next/headers";
import { WHOAMI_COOKIE, parseWhoCookie } from "../lib/whoami";

export default function TopBar({ backHref, backLabel = "← Menu" }) {
  const who = parseWhoCookie(cookies().get(WHOAMI_COOKIE)?.value);

  return (
    <div className="topbar">
      <Link
        href="/dashboard"
        className="brand"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <img
          src="https://adastraauctions.com/wp-content/uploads/2021/07/AdAstra-Logo-Small.png"
          alt="Ad Astra / CCG"
        />
        <span className="storeName">WAREHOUSE</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {who && (
          <Link
            href="/who"
            className="back"
            style={{ opacity: 0.85, fontSize: 13 }}
          >
            {who.name}
          </Link>
        )}
        {backHref && (
          <Link className="back" href={backHref}>
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
