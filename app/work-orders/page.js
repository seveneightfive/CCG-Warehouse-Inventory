import Link from "next/link";
import TopBar from "../../components/TopBar";
import { listRecords, TABLES, WORK_ORDER_FIELDS } from "../../lib/airtable";
import { flattenToStrings, formatDate } from "../../lib/format";
import { statusColor, WORK_ORDER_STATUS_COLORS } from "../../lib/statusColors";

export const dynamic = "force-dynamic";

export default async function WorkOrdersPage() {
  const records = await listRecords(TABLES.workOrders, {
    filterByFormula: '{Status} != "Complete"',
  });
  records.sort((a, b) => {
    const da = a.fields[WORK_ORDER_FIELDS.date] || "";
    const db = b.fields[WORK_ORDER_FIELDS.date] || "";
    return db.localeCompare(da);
  });

  return (
    <>
      <TopBar backHref="/dashboard" />
      <div className="content">
        <h1 className="pageTitle">Work Orders</h1>
        <p className="pageSub">Open work · {records.length}</p>

        {records.length === 0 && (
          <div className="emptyState">Nothing open. Nice.</div>
        )}

        {records.map((r) => {
          const f = r.fields;
          const game = flattenToStrings(f["Inventory Item"]);
          const flagged = !!f[WORK_ORDER_FIELDS.flaggedByBoss];
          return (
            <Link
              key={r.id}
              href={`/wo/${r.id}`}
              className={`card ${flagged ? "flagged" : ""}`}
            >
              <div className="sku">{f[WORK_ORDER_FIELDS.woId]}</div>
              <div className="title">{game.join(", ") || "(no game linked)"}</div>
              <div className="meta">
                <span>{f[WORK_ORDER_FIELDS.notes]?.slice(0, 60)}</span>
              </div>
              <div className="meta">
                <span
                  className="statusPill"
                  style={{
                    background: statusColor(
                      f[WORK_ORDER_FIELDS.status] || "Just Assigned",
                      WORK_ORDER_STATUS_COLORS
                    ).bar,
                    color: "#fff",
                  }}
                >
                  {f[WORK_ORDER_FIELDS.status] || "Just Assigned"}
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
