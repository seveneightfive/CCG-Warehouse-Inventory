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
import {
  statusColor,
  INVENTORY_STATUS_COLORS,
  INSPECTION_OUTCOME_COLORS,
} from "../../lib/statusColors";

export const dynamic = "force-dynamic";

export default async function BoardPage({ searchParams }) {
  const activeStatus = searchParams?.status || "";
  const needsAttention = searchParams?.attention === "1";

  let filterByFormula;
  if (needsAttention) {
    filterByFormula = `{Inspection Outcome} = "Needs Attention"`;
  } else if (activeStatus) {
    filterByFormula = `{Status} = "${activeStatus}"`;
  } else {
    filterByFormula = `{Status} != "Sold"`;
  }

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
          {needsAttention
            ? "Needs attention"
            : activeStatus || "In warehouse now"}{" "}
          · {records.length} item{records.length === 1 ? "" : "s"}
        </p>

        <div className="tabRow">
          <Link
            href="/board"
            className={`tab ${!activeStatus && !needsAttention ? "active" : ""}`}
          >
            In Warehouse Now
          </Link>
          <Link
            href="/board?attention=1"
            className={`tab ${needsAttention ? "active" : ""}`}
            style={{ color: needsAttention ? undefined : "#C0392B" }}
          >
            Needs Attention
          </Link>
          {STATUS_CHOICES.map((s) => (
            <Link
              key={s.name}
              href={`/board?status=${encodeURIComponent(s.name)}`}
              className={`tab ${!needsAttention && activeStatus === s.name ? "active" : ""}`}
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
          const outcome = f[INVENTORY_FIELDS.inspectionOutcome];
          const c = statusColor(status, INVENTORY_STATUS_COLORS);
          const oc = outcome ? INSPECTION_OUTCOME_COLORS[outcome] : null;
          return (
            <Link
              key={r.id}
              href={`/game/${r.id}`}
              className="card"
              style={{ borderLeftColor: oc ? oc.bar : c.bar }}
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
                {oc && (
                  <span
                    className="statusPill"
                    style={{ background: oc.bar, color: "#fff" }}
                  >
                    {outcome}
                  </span>
                )}
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
