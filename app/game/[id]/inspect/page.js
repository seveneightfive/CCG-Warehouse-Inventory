import TopBar from "../../../../components/TopBar";
import InspectionForm from "../../../../components/InspectionForm";
import {
  getRecord,
  getSelectFieldChoices,
  TABLES,
  INVENTORY_FIELDS,
  BRAND_FIELD_ID,
  BRAND_CHOICES,
} from "../../../../lib/airtable";

export const dynamic = "force-dynamic";

export default async function InspectPage({ params }) {
  const [record, liveBrands] = await Promise.all([
    getRecord(TABLES.inventory, params.id),
    getSelectFieldChoices(TABLES.inventory, BRAND_FIELD_ID),
  ]);
  const f = record.fields;
  const brandChoices = liveBrands || BRAND_CHOICES;

  return (
    <>
      <TopBar title="Inspection" backHref={`/game/${params.id}`} backLabel="Game" />
      <div className="content">
        <div className="sku">{f[INVENTORY_FIELDS.sku]}</div>
        <h1 className="pageTitle">Inspect: {f[INVENTORY_FIELDS.title]}</h1>
        <p className="pageSub">Every game goes through this before it's sale-ready.</p>

        <InspectionForm record={record} brandChoices={brandChoices} />
      </div>
    </>
  );
}
