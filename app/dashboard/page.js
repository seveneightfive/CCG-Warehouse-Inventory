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
  return listRecords(TABLES.workOrders, {
    filterByFormula: 'AND({Flagged by Boss} = 1, {Status} != "Complete")',
  });
}

export default async function DashboardPage() {
  const [flagged, locations] = await Promise.all([
    getFlaggedRequests(),
    listRecords(TABLES.locations),
  ]);
  const locationMap = buildNameMap(locations, LOCATION_FIELDS.name);

return (
    <div className="homeDark">
      <TopBar title="Home" />
      <div className="homeHeader">
        <img className="homeLogo" src="/CapitalIcon-White.png" alt="Capital City Games & Music" />
        <h1>CAPITAL CITY GAMES &amp; MUSIC</h1>
        <div className="homeTagline">Inventory · Parts · Work Orders · More</div>
      </div>

      <div className="content">
        <Link href="/search" className="searchBtn">
          🔍 Search Inventory
          <small>Find games, parts, work orders</small>
        </Link>

        <div className="iconGrid" style={{ marginBottom: 24 }}>
          {/* ...same four Link tiles as before, unchanged... */}
        </div>

        <h2 className="pageTitle" style={{ fontSize: 20, marginBottom: 4 }}>Boss Requests</h2>
        <p className="pageSub">
          {flagged.length === 0
            ? "Nothing flagged right now."
            : `${flagged.length} open request${flagged.length === 1 ? "" : "s"} from the boss`}
        </p>

        {flagged.length === 0 && <div className="emptyState">All caught up.</div>}

        {flagged.map((r) => {
          const f = r.fields;
          const locs = resolveNames(f[WORK_ORDER_FIELDS.itemLocation], locationMap);
          return (
            <Link key={r.id} href={`/wo/${r.id}`} className="card flagged">
              <div className="sku">{f[WORK_ORDER_FIELDS.woId]}</div>
              <div className="title">
                {f[WORK_ORDER_FIELDS.notes] ? f[WORK_ORDER_FIELDS.notes].slice(0, 80) : "(no note)"}
              </div>
              <div className="meta">
                {locs.length > 0 && <span>{locs.join(", ")}</span>}
                <span className="statusPill">{f[WORK_ORDER_FIELDS.status] || "Just Assigned"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}