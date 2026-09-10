import Link from "next/link";
import TopBar from "../../../components/TopBar";
import GameEditForm from "../../../components/GameEditForm";
import QuickFillForm from "../../../components/QuickFillForm";
import {
  getRecord,
  listRecords,
  TABLES,
  INVENTORY_FIELDS,
  CONSIGNOR_FIELDS,
  LOCATION_FIELDS,
  CUSTOMER_FIELDS,
  buildNameMap,
  resolveNames,
} from "../../../lib/airtable";
import { formatDate } from "../../../lib/format";
import { INSPECTION_OUTCOME_COLORS } from "../../../lib/statusColors";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }) {
  const [record, locations, consignors, customers] = await Promise.all([
    getRecord(TABLES.inventory, params.id),
    listRecords(TABLES.locations),
    listRecords(TABLES.consignors),
    listRecords(TABLES.customers),
  ]);
  const f = record.fields;
  const consignorMap = buildNameMap(consignors, CONSIGNOR_FIELDS.name);
  const customerMap = buildNameMap(customers, CUSTOMER_FIELDS.name);
  const consignor = resolveNames(f[INVENTORY_FIELDS.consignor], consignorMap);
  const customer = resolveNames(f[INVENTORY_FIELDS.customer], customerMap);
  const sourceType = f[INVENTORY_FIELDS.sourceType];

  let ownerLine = "";
  if (sourceType === "Customer Repair") {
    ownerLine = customer.join(", ") || "Customer repair";
  } else if (sourceType === "In-House Purchase") {
    ownerLine = "CCG (in-house)";
  } else {
    ownerLine = consignor.join(", ") || f[INVENTORY_FIELDS.skuPrefix] || "Consignment";
  }

  // A placeholder label hasn't had a real game entered against it yet —
  // show the fast confirm-and-fill form instead of the full edit screen.
  if (f[INVENTORY_FIELDS.placeholder]) {
    return (
      <>
        <TopBar backHref="/labels/fill" backLabel="← Fill In Games" />
        <div className="content">
          <h1 className="pageTitle">New Game</h1>
          <p className="pageSub">This label hasn't been assigned to a game yet.</p>
          <QuickFillForm record={record} ownerLabel={ownerLine} />
        </div>
      </>
    );
  }

  const locationOptions = locations.map((l) => ({
    id: l.id,
    name: l.fields[LOCATION_FIELDS.name] || "(unnamed)",
  }));
  const consignorOptions = consignors.map((c) => ({
    id: c.id,
    name: c.fields[CONSIGNOR_FIELDS.name] || "(unnamed)",
  }));

  return (
    <>
      <TopBar backHref="/board" backLabel="← Inventory" />
      <div className="content">
        <div className="sku">{f[INVENTORY_FIELDS.sku]}</div>
        <h1 className="pageTitle">{f[INVENTORY_FIELDS.title]}</h1>
        <p className="pageSub">
          {ownerLine} · Received {formatDate(f[INVENTORY_FIELDS.dateReceived])}
          {f[INVENTORY_FIELDS.lastUpdatedBy] &&
            ` · Last updated by ${f[INVENTORY_FIELDS.lastUpdatedBy]}`}
        </p>

        <Link
          href={`/game/${record.id}/inspect`}
          className={`btn ${f[INVENTORY_FIELDS.inspectionComplete] ? "secondary" : "flag"}`}
          style={{ marginBottom: 10 }}
        >
          {f[INVENTORY_FIELDS.inspectionComplete]
            ? "Inspection complete — edit"
            : "Start inspection"}
        </Link>

        {f[INVENTORY_FIELDS.inspectionOutcome] && (
          <div style={{ marginBottom: 20 }}>
            <span
              className="statusPill"
              style={{
                background:
                  INSPECTION_OUTCOME_COLORS[f[INVENTORY_FIELDS.inspectionOutcome]].bar,
                color: "#fff",
              }}
            >
              {f[INVENTORY_FIELDS.inspectionOutcome]}
            </span>
          </div>
        )}

        <GameEditForm
          record={record}
          locations={locationOptions}
          consignors={consignorOptions}
        />
      </div>
    </>
  );
}
