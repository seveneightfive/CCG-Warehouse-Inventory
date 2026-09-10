import Link from "next/link";
import TopBar from "../../components/TopBar";
import {
  listRecords,
  TABLES,
  WORK_ORDER_FIELDS,
  LOCATION_FIELDS,
  buildNameMap,
  resolveNames,
} from "../../lib/airtable";

export const dynamic = "force-dynamic";

async function getFlaggedRequests() {
  const records = await listRecords(TABLES.workOrders, {
    filterByFormula:
      'AND({Flagged by Boss} = 1, {Status} != "Complete")',
  });
  return records;
}

export default async function DashboardPage() {
  const [flagged, locations] = await Promise.all([
    getFlaggedRequests(),
    listRecords(TABLES.locations),
  ]);
  const locationMap = buildNameMap(locations, LOCATION_FIELDS.name);

  return (
    <>
      <TopBar />
      <div className="content">
        <h1 className="pageTitle">Boss Requests</h1>
        <p className="pageSub">
          {flagged.length === 0
            ? "Nothing flagged right now."
            : `${flagged.length} open request${flagged.length === 1 ? "" : "s"} from the boss`}
        </p>

        {flagged.length === 0 && (
          <div className="emptyState">All caught up.</div>
        )}

        {flagged.map((r) => {
          const f = r.fields;
          const locations = resolveNames(f[WORK_ORDER_FIELDS.itemLocation], locationMap);
          return (
            <Link
              key={r.id}
              href={`/wo/${r.id}`}
              className="card flagged"
            >
              <div className="sku">{f[WORK_ORDER_FIELDS.woId]}</div>
              <div className="title">
                {f[WORK_ORDER_FIELDS.notes]
                  ? f[WORK_ORDER_FIELDS.notes].slice(0, 80)
                  : "(no note)"}
              </div>
              <div className="meta">
                {locations.length > 0 && <span>{locations.join(", ")}</span>}
                <span className="statusPill">
                  {f[WORK_ORDER_FIELDS.status] || "Just Assigned"}
                </span>
              </div>
            </Link>
          );
        })}

        <div className="navGrid">
          <Link href="/board">
            Inventory
            <small>Browse & update games</small>
          </Link>
          <Link href="/work-orders">
            Work Orders
            <small>All logged work</small>
          </Link>
          <Link href="/work-orders/new">
            + New Work Order
            <small>Log work or flag a request</small>
          </Link>
          <Link href="/labels">
            Print Labels
            <small>QR sticker sheets</small>
          </Link>
        </div>
      </div>
    </>
  );
}
