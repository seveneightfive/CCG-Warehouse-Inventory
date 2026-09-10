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
        <TopBar title="New Game" backHref="/labels/fill" backLabel="Fill In Games" />
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

  const inspected = !!f[INVENTORY_FIELDS.inspectionComplete];
  const printed = !!f[INVENTORY_FIELDS.detailsSheetPrinted];
  const outcome = f[INVENTORY_FIELDS.inspectionOutcome];

  return (
    <>
      <TopBar title="Game Details" backHref="/board" backLabel="Inventory" />
      <div className="content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div className="sku">{f[INVENTORY_FIELDS.sku]}</div>
            <h1 className="pageTitle" style={{ wordBreak: "break-word" }}>
              {f[INVENTORY_FIELDS.title]}
            </h1>
          </div>
          <Link
            href={`/game/${record.id}/inspect`}
            className="statusPill"
            style={{
              background: inspected ? "var(--surface-2)" : "var(--flag)",
              color: inspected ? "var(--ink)" : "var(--flag-ink)",
              flex: "0 0 auto",
              whiteSpace: "nowrap",
            }}
          >
            {inspected ? "Inspection complete" : "Do initial inspection"}
          </Link>
        </div>

        <p className="pageSub">
          {ownerLine} · Received {formatDate(f[INVENTORY_FIELDS.dateReceived])}
          {f[INVENTORY_FIELDS.lastUpdatedBy] &&
            ` · Last updated by ${f[INVENTORY_FIELDS.lastUpdatedBy]}`}
        </p>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
          {outcome && (
            <span
              className="statusPill"
              style={{
                background: INSPECTION_OUTCOME_COLORS[outcome].bar,
                color: "#fff",
              }}
            >
              {outcome}
            </span>
          )}
          <Link
            href={`/game/${record.id}/print`}
            className="statusPill"
            style={{
              background: printed ? "var(--surface-2)" : "var(--ink)",
              color: printed ? "var(--ink)" : "#fff",
              textDecoration: "none",
            }}
            title={printed ? "Sheet has been printed" : "Not printed yet"}
          >
            {printed ? "Print sheet ✓" : "Print sheet — not yet printed"}
          </Link>
        </div>

        {inspected && (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              padding: 14,
              marginBottom: 20,
              fontSize: 13.5,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><b>Condition:</b> {f[INVENTORY_FIELDS.condition] || "—"}</div>
              <div><b>Dedicated:</b> {f[INVENTORY_FIELDS.dedicatedCabinet] ? "Yes" : "No"}</div>
              <div><b>Brand:</b> {f[INVENTORY_FIELDS.brand] || "—"}</div>
              <div><b>Serial #:</b> {f[INVENTORY_FIELDS.serialNumber] || "—"}</div>
            </div>
            {f[INVENTORY_FIELDS.conditionNotes] && (
              <div style={{ marginTop: 8 }}>
                <b>Condition notes:</b> {f[INVENTORY_FIELDS.conditionNotes]}
              </div>
            )}
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
