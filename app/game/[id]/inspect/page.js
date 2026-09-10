import TopBar from "../../../../components/TopBar";
import InspectionForm from "../../../../components/InspectionForm";
import { getRecord, TABLES, INVENTORY_FIELDS } from "../../../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function InspectPage({ params }) {
  const record = await getRecord(TABLES.inventory, params.id);
  const f = record.fields;

  return (
    <>
      <TopBar title="Inspection" backHref={`/game/${params.id}`} backLabel="Game" />
      <div className="content">
        <div className="sku">{f[INVENTORY_FIELDS.sku]}</div>
        <h1 className="pageTitle">Inspect: {f[INVENTORY_FIELDS.title]}</h1>
        <p className="pageSub">Every game goes through this before it's sale-ready.</p>

        <InspectionForm record={record} />
      </div>
    </>
  );
}
