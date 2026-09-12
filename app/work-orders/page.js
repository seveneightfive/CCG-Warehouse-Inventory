import Link from "next/link";
import TopBar from "../../components/TopBar";
import { listRecords, TABLES, WORK_ORDER_FIELDS } from "../../lib/airtable";
import { flattenToStrings, formatDate } from "../../lib/format";
import { statusColor, WORK_ORDER_STATUS_COLORS } from "../../lib/statusColors";

export const dynamic = "force-dynamic";

const FILTERS = ["Just Assigned", "In progress", "Delayed", "Complete"];

export default async function WorkOrdersPage({ searchParams }) {
  const activeFilter = searchParams?.status || "Just Assigned";

  const allRecords = await listRecords(TABLES.workOrders);
  const counts = {};
  FILTERS.forEach((s) => {
    counts[s] = allRecords.filter(
      (r) => r.fields[WORK_ORDER_FIELDS.status] === s
    ).length;
  });

  const records = allRecords
    .filter((r) => r.fields[WORK_ORDER_FIELDS.status] === activeFilter)
    .sort((a, b) => {
      const da = a.fields[WORK_ORDER_FIELDS.date] || "";
      const db = b.fields[WORK_ORDER_FIELDS.date] || "";
      return db.localeCompare(da);
    });

  return (
    <>
      <TopBar title="Work Orders" backHref="/dashboard" backLabel="Dashboard" />
      <div className="content">
        <p className="pageSub">{activeFilter} · {records.length}</p>

        <div className="pillRow">
          {FILTERS.map((s) => (
            <Link
              key={s}
              href={`/work-orders?status=${encodeURIComponent(s)}`}
              className={`pill ${activeFilter === s ? "active" : ""}`}
            >
              {s}
              <span className="count">{counts[s]}</span>
            </Link>
          ))}
        </div>

        {records.length === 0 && <div className="emptyState">Nothing here.</div>}

        {records.map((r) => {
          const f = r.fields;
          const game = flattenToStrings(f["Inventory Item"]);
          const flagged = !!f[WORK_ORDER_FIELDS.flaggedByBoss];
          const status = f[WORK_ORDER_FIELDS.status] || "Just Assigned";
          const c = statusColor(status, WORK_ORDER_STATUS_COLORS);
          return (
            <Link
              key={r.id}
              href={`/wo/${r.id}`}
              className={`card ${flagged ? "flagged" : ""}`}
              style={{ borderLeftColor: flagged ? undefined : c.bar }}
            >
              <div className="sku">{f[WORK_ORDER_FIELDS.woId]}</div>
              <div className="title">{game.join(", ") || "(no game linked)"}</div>
              <div className="meta">
                <span>{f[WORK_ORDER_FIELDS.notes]?.slice(0, 60)}</span>
              </div>
              <div className="meta">
                <span
                  className="statusPill"
                  style={{ background: c.bar, color: "#fff" }}
                >
                  {status}
                </span>
                <span>{formatDate(f[WORK_ORDER_FIELDS.date])}</span>
              </div>
            </Link>
          );
        })}

        <Link href="/work-orders/new" className="btn fab">
          + New Work Order
        </Link>
      </div>
    </>
  );
}