import Link from "next/link";
import TopBar from "../../components/TopBar";
import InventoryCard from "../../components/InventoryCard";
import {
  listRecords,
  TABLES,
  INVENTORY_FIELDS,
  CONSIGNOR_FIELDS,
  LOCATION_FIELDS,
  buildNameMap,
  resolveNames,
} from "../../lib/airtable";
import {
  statusColor,
  INVENTORY_STATUS_COLORS,
  INSPECTION_OUTCOME_COLORS,
} from "../../lib/statusColors";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "In Warehouse Now" },
  { key: "just-received", label: "Just Received" },
  { key: "needs-attention", label: "Needs Attention" },
  { key: "ready", label: "Ready for Sale" },
  { key: "auction", label: "Going to Auction" },
  { key: "sold", label: "Sold" },
];

export default async function BoardPage({ searchParams }) {
  const activeFilter = searchParams?.filter || "all";

  const [allRecords, consignors, locations] = await Promise.all([
    listRecords(TABLES.inventory, {
      filterByFormula: `{Placeholder} != 1`,
    }),
    listRecords(TABLES.consignors),
    listRecords(TABLES.locations),
  ]);
  const consignorMap = buildNameMap(consignors, CONSIGNOR_FIELDS.name);
  const locationMap = buildNameMap(locations, LOCATION_FIELDS.name);

  const counts = {
    all: 0,
    "just-received": 0,
    "needs-attention": 0,
    ready: 0,
    auction: 0,
    sold: 0,
    inWarehouse: 0,
    onLocation: 0,
  };

  const matches = (r, key) => {
    const f = r.fields;
    const status = f[INVENTORY_FIELDS.status];
    const outcome = f[INVENTORY_FIELDS.inspectionOutcome];
    const inspected = !!f[INVENTORY_FIELDS.inspectionComplete];
    switch (key) {
      case "just-received":
        return !inspected;
      case "needs-attention":
        return outcome === "Needs Attention";
      case "ready":
        return outcome === "Ready to Clean & Photograph";
      case "auction":
        return status === "Going to Auction" || status === "Ready for Auction";
      case "sold":
        return status === "Sold" || status === "Sold - Awaiting Pickup";
      case "all":
      default:
        return status !== "Sold";
    }
  };

  allRecords.forEach((r) => {
    const hasLocation = (r.fields[INVENTORY_FIELDS.location] || []).length > 0;
    if (matches(r, "all")) {
      counts.all += 1;
      if (hasLocation) counts.onLocation += 1;
      else counts.inWarehouse += 1;
    }
    if (matches(r, "just-received")) counts["just-received"] += 1;
    if (matches(r, "needs-attention")) counts["needs-attention"] += 1;
    if (matches(r, "ready")) counts.ready += 1;
    if (matches(r, "auction")) counts.auction += 1;
    if (matches(r, "sold")) counts.sold += 1;
  });

  const records = allRecords
    .filter((r) => matches(r, activeFilter))
    .sort((a, b) => {
      const da = a.fields[INVENTORY_FIELDS.dateReceived] || "";
      const db = b.fields[INVENTORY_FIELDS.dateReceived] || "";
      return db.localeCompare(da);
    });

  return (
    <>
      <TopBar title="Inventory" backHref="/dashboard" backLabel="Dashboard" />
      <div className="content">
        <div className="statRow">
          <div className="statCard">
            <div className="label">
              <span className="dot" style={{ background: "#12798a" }} />
              In Warehouse
            </div>
            <div className="value">{counts.inWarehouse}</div>
          </div>
          <div className="statCard">
            <div className="label">
              <span className="dot" style={{ background: "#e7a93d" }} />
              On Location
            </div>
            <div className="value">{counts.onLocation}</div>
          </div>
        </div>

        <div className="pillRow">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/board" : `/board?filter=${f.key}`}
              className={`pill ${activeFilter === f.key ? "active" : ""}`}
            >
              {f.label}
              <span className="count">{counts[f.key]}</span>
            </Link>
          ))}
        </div>

        {records.length === 0 && <div className="emptyState">Nothing here.</div>}

        {records.map((r) => {
          const f = r.fields;
          const consignor = resolveNames(f[INVENTORY_FIELDS.consignor], consignorMap);
          const location = resolveNames(f[INVENTORY_FIELDS.location], locationMap);
          const status = f[INVENTORY_FIELDS.status];
          const outcome = f[INVENTORY_FIELDS.inspectionOutcome];
          const c = statusColor(status, INVENTORY_STATUS_COLORS);
          const oc = outcome ? INSPECTION_OUTCOME_COLORS[outcome] : null;
          return (
            <InventoryCard
              key={r.id}
              id={r.id}
              sku={f[INVENTORY_FIELDS.sku]}
              title={f[INVENTORY_FIELDS.title]}
              thumbUrl={f[INVENTORY_FIELDS.photo]?.[0]?.thumbnails?.small?.url}
              status={status}
              statusColorHex={c.bar}
              outcome={outcome}
              outcomeColorHex={oc?.bar}
              consignorLine={consignor.join(", ")}
              locationLine={location.join(", ")}
            />
          );
        })}

        <Link href="/game/new" className="btn fab">
          + Add a Game
        </Link>
      </div>
    </>
  );
}
