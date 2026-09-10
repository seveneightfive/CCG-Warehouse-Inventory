import Link from "next/link";
import TopBar from "../../../components/TopBar";
import GameEditForm from "../../../components/GameEditForm";
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

  const locationOptions = locations.map((l) => ({
    id: l.id,
    name: l.fields[LOCATION_FIELDS.name] || "(unnamed)",
  }));
  const consignorOptions = consignors.map((c) => ({
    id: c.id,
    name: c.fields[CONSIGNOR_FIELDS.name] || "(unnamed)",
  }));

  let ownerLine = "";
  if (sourceType === "Customer Repair") {
    ownerLine = customer.join(", ") || "Customer repair";
  } else if (sourceType === "In-House Purchase") {
    ownerLine = "CCG (in-house)";
  } else {
    ownerLine = consignor.join(", ") || "Consignment";
  }

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
          style={{ marginBottom: 20 }}
        >
          {f[INVENTORY_FIELDS.inspectionComplete]
            ? "Inspection complete — edit"
            : "Start inspection"}
        </Link>

        <GameEditForm
          record={record}
          locations={locationOptions}
          consignors={consignorOptions}
        />
      </div>
    </>
  );
}
