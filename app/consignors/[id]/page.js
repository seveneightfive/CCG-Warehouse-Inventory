import Link from "next/link";
import TopBar from "../../../components/TopBar";
import {
  getRecord,
  TABLES,
  CONSIGNOR_FIELDS,
  INVENTORY_FIELDS,
} from "../../../lib/airtable";
import { statusColor, INVENTORY_STATUS_COLORS } from "../../../lib/statusColors";

export const dynamic = "force-dynamic";

export default async function ConsignorDetailPage({ params }) {
  const consignor = await getRecord(TABLES.consignors, params.id);
  const f = consignor.fields;
  const gameIds = (f[CONSIGNOR_FIELDS.allConsignments] || []).map((v) =>
    typeof v === "string" ? v : v.id
  );

  const games = gameIds.length
    ? await Promise.all(gameIds.map((id) => getRecord(TABLES.inventory, id)))
    : [];

  games.sort((a, b) => {
    const da = a.fields[INVENTORY_FIELDS.dateReceived] || "";
    const db = b.fields[INVENTORY_FIELDS.dateReceived] || "";
    return db.localeCompare(da);
  });

  return (
    <>
      <TopBar title="Consignor" backHref="/consignors" backLabel="Consignors" />
      <div className="content">
        <div className="sku">{f[CONSIGNOR_FIELDS.code]}</div>
        <h1 className="pageTitle">{f[CONSIGNOR_FIELDS.name]}</h1>
        {(f[CONSIGNOR_FIELDS.phone] || f[CONSIGNOR_FIELDS.contactInfo]) && (
          <p className="pageSub">
            {[f[CONSIGNOR_FIELDS.phone], f[CONSIGNOR_FIELDS.contactInfo]].filter(Boolean).join(" · ")}
          </p>
        )}

        <h2 style={{ fontSize: 16, margin: "18px 0 8px" }}>
          Games ({games.length})
        </h2>

        {games.length === 0 && <div className="emptyState">No games linked yet.</div>}

        {games.map((g) => {
          const gf = g.fields;
          const status = gf[INVENTORY_FIELDS.status];
          const c = statusColor(status, INVENTORY_STATUS_COLORS);
          return (
            <Link
              key={g.id}
              href={`/game/${g.id}`}
              className="card"
              style={{ borderLeftColor: c.bar }}
            >
              <div className="sku">{gf[INVENTORY_FIELDS.sku]}</div>
              <div className="title">{gf[INVENTORY_FIELDS.title]}</div>
              <div className="meta">
                <span className="statusPill" style={{ background: c.bar, color: "#fff" }}>
                  {status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}