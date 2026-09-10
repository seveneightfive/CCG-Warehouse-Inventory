import TopBar from "../../../components/TopBar";
import WorkOrderEditForm from "../../../components/WorkOrderEditForm";
import { getRecord, TABLES, WORK_ORDER_FIELDS } from "../../../lib/airtable";
import { flattenToStrings, formatDate } from "../../../lib/format";

export const dynamic = "force-dynamic";

export default async function WorkOrderDetailPage({ params }) {
  const record = await getRecord(TABLES.workOrders, params.id);
  const f = record.fields;
  const game = flattenToStrings(f["Inventory Item"]);
  const location = flattenToStrings(f[WORK_ORDER_FIELDS.itemLocation]);
  const flagged = !!f[WORK_ORDER_FIELDS.flaggedByBoss];

  return (
    <>
      <TopBar backHref="/work-orders" />
      <div className="content">
        <div className="sku">{f[WORK_ORDER_FIELDS.woId]}</div>
        <h1 className="pageTitle">{game.join(", ") || "Work Order"}</h1>
        <p className="pageSub">
          {flagged && "Flagged by boss · "}
          {location.length > 0 && `${location.join(", ")} · `}
          {formatDate(f[WORK_ORDER_FIELDS.date])}
          {f[WORK_ORDER_FIELDS.lastUpdatedBy] &&
            ` · Last updated by ${f[WORK_ORDER_FIELDS.lastUpdatedBy]}`}
        </p>

        <WorkOrderEditForm record={record} />
      </div>
    </>
  );
}
