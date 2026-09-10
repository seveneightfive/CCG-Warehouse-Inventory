import Link from "next/link";
import TopBar from "../../components/TopBar";
import {
  listRecords,
  TABLES,
  INVENTORY_FIELDS,
  STATUS_CHOICES,
  CONSIGNOR_FIELDS,
  LOCATION_FIELDS,
  buildNameMap,
  resolveNames,
} from "../../lib/airtable";
import { formatDate } from "../../lib/format";
import { statusColor, INVENTORY_STATUS_COLORS } from "../../lib/statusColors";

export const dynamic = "force-dynamic";

export default async function BoardPage({ searchParams }) {
  const activeStatus = searchParams?.status || "";

  const filterByFormula = activeStatus
    ? `{Status} = "${activeStatus}"`
    : `{Status} != "Sold"`;

  const [records, consignors, locations] = await Promise.all([
    listRecords(TABLES.inventory, { filterByFormula }),
    listRecords(TABLES.consignors),
    listRecords(TABLES.locations),
  ]);
  const consignorMap = buildNameMap(consignors, CONSIGNOR_FIELDS.name);
  const locationMap = buildNameMap(locations, LOCATION_FIELDS.name);

  records.sort((a, b) => {
    const da = a.fields[INVENTORY_FIELDS.dateReceived] || "";
    const db = b.fields[INVENTORY_FIELDS.dateReceived] || "";
    return db.localeCompare(da);
  });

  return (
    <>
      <TopBar backHref="/dashboard" />
      <div className="content">
        <h1 className="pageTitle">Inventory</h1>
        <p className="pageSub">
          {activeStatus || "In warehouse now"} · {records.length} item
          {records.length === 1 ? "" : "s"}
        </p>

        <div className="tabRow">
          <Link
            href="/board"
            className={`tab ${!activeStatus ? "active" : ""}`}
          >
            In Warehouse Now
          </Link>
          {STATUS_CHOICES.map((s) => (
            <Link
              key={s.name}
              href={`/board?status=${encodeURIComponent(s.name)}`}
              className={`tab ${activeStatus === s.name ? "active" : ""}`}
            >
              {s.name}
            </Link>
          ))}
        </div>

        {records.length === 0 && (
          <div className="emptyState">Nothing here.</div>
        )}

        {records.map((r) => {
          const f = r.fields;
          const consignor = resolveNames(f[INVENTORY_FIELDS.consignor], consignorMap);
          const location = resolveNames(f[INVENTORY_FIELDS.location], locationMap);
          const status = f[INVENTORY_FIELDS.status];
          const c = statusColor(status, INVENTORY_STATUS_COLORS);
          return (
            <Link
              key={r.id}
              href={`/game/${r.id}`}
              className="card"
              style={{ borderLeftColor: c.bar }}
            >
              <div className="sku">{f[INVENTORY_FIELDS.sku] || "no sku"}</div>
              <div className="title">
                {f[INVENTORY_FIELDS.title] || "(untitled)"}
              </div>
              <div className="meta">
                <span
                  className="statusPill"
                  style={{ background: c.bar, color: "#fff" }}
                >
                  {status}
                </span>
                {consignor.length > 0 && <span>{consignor.join(", ")}</span>}
                {location.length > 0 && <span>{location.join(", ")}</span>}
                <span>{formatDate(f[INVENTORY_FIELDS.dateReceived])}</span>
              </div>
            </Link>
          );
        })}

        <Link href="/game/new" className="btn fab">
          + Add a Game
        </Link>
      </div>
    </>
  );
}
