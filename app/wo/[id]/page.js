import TopBar from "../../../components/TopBar";
import WorkOrderEditForm from "../../../components/WorkOrderEditForm";
import {
  getRecord,
  listRecords,
  TABLES,
  WORK_ORDER_FIELDS,
  LOCATION_FIELDS,
  buildNameMap,
  resolveNames,
} from "../../../lib/airtable";
import { flattenToStrings, formatDate } from "../../../lib/format";

export const dynamic = "force-dynamic";

export default async function WorkOrderDetailPage({ params }) {
  const [record, locations] = await Promise.all([
    getRecord(TABLES.workOrders, params.id),
    listRecords(TABLES.locations),
  ]);
  const locationMap = buildNameMap(locations, LOCATION_FIELDS.name);
  const f = record.fields;
  const game = flattenToStrings(f["Inventory Item"]);
  const location = resolveNames(f[WORK_ORDER_FIELDS.itemLocation], locationMap);
  const flagged = !!f[WORK_ORDER_FIELDS.flaggedByBoss];

  return (
    <>
      <TopBar title="Work Order" backHref="/work-orders" backLabel="Work Orders" />
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
