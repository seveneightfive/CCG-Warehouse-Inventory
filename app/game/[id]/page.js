import TopBar from "../../../components/TopBar";
import GameEditForm from "../../../components/GameEditForm";
import { getRecord, listRecords, TABLES, INVENTORY_FIELDS } from "../../../lib/airtable";
import { flattenToStrings, formatDate } from "../../../lib/format";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }) {
  const [record, locations] = await Promise.all([
    getRecord(TABLES.inventory, params.id),
    listRecords(TABLES.locations),
  ]);
  const f = record.fields;
  const consignor = flattenToStrings(f[INVENTORY_FIELDS.consignor]);
  const locationOptions = locations.map((l) => ({
    id: l.id,
    name: l.fields["Location Name"] || "(unnamed)",
  }));

  return (
    <>
      <TopBar backHref="/board" backLabel="← Inventory" />
      <div className="content">
        <div className="sku">{f[INVENTORY_FIELDS.sku]}</div>
        <h1 className="pageTitle">{f[INVENTORY_FIELDS.title]}</h1>
        <p className="pageSub">
          {consignor.join(", ") || "CCG (in-house)"} · Received{" "}
          {formatDate(f[INVENTORY_FIELDS.dateReceived])}
          {f[INVENTORY_FIELDS.lastUpdatedBy] &&
            ` · Last updated by ${f[INVENTORY_FIELDS.lastUpdatedBy]}`}
        </p>

        <GameEditForm record={record} locations={locationOptions} />
      </div>
    </>
  );
}
