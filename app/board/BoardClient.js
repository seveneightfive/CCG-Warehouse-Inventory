"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import InventoryCard from "../../components/InventoryCard";
import { db } from "../../lib/db";
import { INVENTORY_FIELDS } from "../../lib/airtable";
import {
  statusColor,
  INVENTORY_STATUS_COLORS,
  INSPECTION_OUTCOME_COLORS,
} from "../../lib/statusColors";

const FILTERS = [
  { key: "all", label: "In Warehouse Now" },
  { key: "needs-attention", label: "Needs Attention" },
  { key: "ready", label: "Ready for Sale" },
  { key: "auction", label: "Going to Auction" },
  { key: "sold", label: "Sold" },
];

function buildMap(arr) {
  return Object.fromEntries(arr.map((x) => [x.id, x.name]));
}

function resolveNames(rawValue, map) {
  const flat = [];
  const flatten = (v) => {
    if (v == null) return;
    if (Array.isArray(v)) v.forEach(flatten);
    else if (typeof v === "object") flat.push(v.id || v.name || JSON.stringify(v));
    else flat.push(String(v));
  };
  flatten(rawValue);
  return flat.map((id) => map[id] || id);
}

export default function BoardClient() {
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") || "all";

  const [allRecords, setAllRecords] = useState([]);
  const [consignorMap, setConsignorMap] = useState({});
  const [locationMap, setLocationMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (navigator.onLine) {
        try {
          const [invRes, lookupRes] = await Promise.all([
            fetch("/api/inventory"),
            fetch("/api/lookups"),
          ]);
          const { records } = await invRes.json();
          const { consignors, locations } = await lookupRes.json();

          await db.inventory.bulkPut(records);
          await db.consignors.bulkPut(consignors);
          await db.locations.bulkPut(locations);

          if (mounted) {
            setAllRecords(records);
            setConsignorMap(buildMap(consignors));
            setLocationMap(buildMap(locations));
            setLoading(false);
          }
          return;
        } catch {
          // network failed even though we thought we were online — fall through
        }
      }

      const [records, consignors, locations] = await Promise.all([
        db.inventory.toArray(),
        db.consignors.toArray(),
        db.locations.toArray(),
      ]);
      if (mounted) {
        setAllRecords(records);
        setConsignorMap(buildMap(consignors));
        setLocationMap(buildMap(locations));
        setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const counts = {
    all: 0, "just-received": 0, "needs-attention": 0,
    ready: 0, auction: 0, sold: 0, inWarehouse: 0, onLocation: 0,
  };

  const matches = (r, key) => {
    const f = r.fields;
    const status = f[INVENTORY_FIELDS.status];
    const outcome = f[INVENTORY_FIELDS.inspectionOutcome];
    const inspected = !!f[INVENTORY_FIELDS.inspectionComplete];
    switch (key) {
      case "just-received": return !inspected;
      case "needs-attention": return outcome === "Needs Attention";
      case "ready": return outcome === "Ready to Clean & Photograph";
      case "auction": return status === "Going to Auction" || status === "Ready for Auction";
      case "sold": return status === "Sold" || status === "Sold - Awaiting Pickup";
      case "all":
      default: return status !== "Sold";
    }
  };

  allRecords.forEach((r) => {
    const hasLocation = (r.fields[INVENTORY_FIELDS.location] || []).length > 0;
    if (matches(r, "all")) {
      counts.all += 1;
      hasLocation ? (counts.onLocation += 1) : (counts.inWarehouse += 1);
    }
    ["just-received", "needs-attention", "ready", "auction", "sold"].forEach((k) => {
      if (matches(r, k)) counts[k] += 1;
    });
  });

  const records = allRecords
    .filter((r) => matches(r, activeFilter))
    .sort((a, b) => {
      const da = a.fields[INVENTORY_FIELDS.dateReceived] || "";
      const dbv = b.fields[INVENTORY_FIELDS.dateReceived] || "";
      return dbv.localeCompare(da);
    });

  if (loading) {
    return <div className="content">Loading…</div>;
  }

  return (
    <div className="content">
      <div className="statRow">
        <div className="statCard">
          <div className="label"><span className="dot" style={{ background: "#12798a" }} />In Warehouse</div>
          <div className="value">{counts.inWarehouse}</div>
        </div>
        <div className="statCard">
          <div className="label"><span className="dot" style={{ background: "#e7a93d" }} />On Location</div>
          <div className="value">{counts.onLocation}</div>
        </div>
        <div className="statCard">
          <div className="label"><span className="dot" style={{ background: "#e7a93d" }} />Needs Inspection</div>
          <div className="value">{counts["just-received"]}</div>
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
        const inspected = !!f[INVENTORY_FIELDS.inspectionComplete];
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
            inspected={inspected}
          />
        );
      })}

      <Link href="/game/new" className="btn fab">+ Add a Game</Link>
    </div>
  );
}