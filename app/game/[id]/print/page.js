import PrintSheetControls from "../../../../components/PrintSheetControls";
import {
  getRecord,
  listRecords,
  TABLES,
  INVENTORY_FIELDS,
  WORK_ORDER_FIELDS,
  CONSIGNOR_FIELDS,
  CUSTOMER_FIELDS,
  buildNameMap,
  resolveNames,
} from "../../../../lib/airtable";
import { formatDate } from "../../../../lib/format";

export const dynamic = "force-dynamic";

export default async function PrintSheetPage({ params }) {
  const [record, consignors, customers] = await Promise.all([
    getRecord(TABLES.inventory, params.id),
    listRecords(TABLES.consignors),
    listRecords(TABLES.customers),
  ]);
  const f = record.fields;
  const consignorMap = buildNameMap(consignors, CONSIGNOR_FIELDS.name);
  const customerMap = buildNameMap(customers, CUSTOMER_FIELDS.name);

  const woIds = (f[INVENTORY_FIELDS.workOrders] || []).map((v) =>
    typeof v === "string" ? v : v.id
  );
  const workOrders = await Promise.all(
    woIds.map((id) => getRecord(TABLES.workOrders, id).catch(() => null))
  );
  const validWorkOrders = workOrders.filter(Boolean);

  const sourceType = f[INVENTORY_FIELDS.sourceType];
  let ownerLine = "Consignment";
  if (sourceType === "Customer Repair") {
    ownerLine = resolveNames(f[INVENTORY_FIELDS.customer], customerMap).join(", ");
  } else if (sourceType === "In-House Purchase") {
    ownerLine = "CCG (in-house)";
  } else {
    ownerLine = resolveNames(f[INVENTORY_FIELDS.consignor], consignorMap).join(", ");
  }

  const photoUrl = f[INVENTORY_FIELDS.photo]?.[0]?.url;

  return (
    <>
      <style>{`
        body { border: none !important; max-width: none !important; font-family: Arial, sans-serif; }
        @media print { .printControls { display: none !important; } }
        .sheet { max-width: 7.5in; margin: 0 auto; padding: 24px; }
        .sheetHeader { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #10131c; padding-bottom: 12px; margin-bottom: 16px; }
        .sheetTitle { font-size: 26px; font-weight: bold; margin: 0; }
        .sheetSku { font-size: 14px; color: #555; letter-spacing: 0.05em; }
        .row2 { display: flex; gap: 24px; margin-bottom: 16px; }
        .col { flex: 1; }
        .fieldRow { margin-bottom: 8px; font-size: 13px; }
        .fieldRow b { display: inline-block; min-width: 140px; color: #333; }
        .section { margin-top: 20px; }
        .sectionTitle { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; }
        .woEntry { border-bottom: 1px dashed #ccc; padding: 8px 0; font-size: 13px; }
        .photo { width: 200px; height: 200px; object-fit: cover; border: 1px solid #ccc; }
      `}</style>

      <div className="printControls" style={{ padding: 16, fontFamily: "sans-serif" }}>
        <PrintSheetControls
          recordId={record.id}
          alreadyPrinted={!!f[INVENTORY_FIELDS.detailsSheetPrinted]}
        />
      </div>

      <div className="sheet">
        <div className="sheetHeader">
          <div>
            <p className="sheetSku">{f[INVENTORY_FIELDS.sku]}</p>
            <h1 className="sheetTitle">{f[INVENTORY_FIELDS.title]}</h1>
          </div>
          {photoUrl && <img src={photoUrl} alt="" className="photo" />}
        </div>

        <div className="row2">
          <div className="col">
            <div className="fieldRow"><b>Owner / Source:</b> {ownerLine}</div>
            <div className="fieldRow"><b>Date Received:</b> {formatDate(f[INVENTORY_FIELDS.dateReceived])}</div>
            <div className="fieldRow"><b>Status:</b> {f[INVENTORY_FIELDS.status]}</div>
            <div className="fieldRow"><b>Source Type:</b> {sourceType}</div>
          </div>
          <div className="col">
            <div className="fieldRow"><b>Condition:</b> {f[INVENTORY_FIELDS.condition] || "—"}</div>
            <div className="fieldRow"><b>Dedicated Cabinet:</b> {f[INVENTORY_FIELDS.dedicatedCabinet] ? "Yes" : "No"}</div>
            <div className="fieldRow"><b>Brand / Manufacturer:</b> {f[INVENTORY_FIELDS.brand] || "—"}</div>
            <div className="fieldRow"><b>Serial #:</b> {f[INVENTORY_FIELDS.serialNumber] || "—"}</div>
          </div>
        </div>

        <div className="section">
          <div className="sectionTitle">Inspection</div>
          <div className="fieldRow"><b>Outcome:</b> {f[INVENTORY_FIELDS.inspectionOutcome] || "Not yet inspected"}</div>
          <div className="fieldRow"><b>Condition Notes:</b> {f[INVENTORY_FIELDS.conditionNotes] || "—"}</div>
          <div className="fieldRow"><b>Description / Notes:</b> {f[INVENTORY_FIELDS.description] || "—"}</div>
        </div>

        <div className="section">
          <div className="sectionTitle">Work History ({validWorkOrders.length})</div>
          {validWorkOrders.length === 0 && <p style={{ fontSize: 13, color: "#666" }}>No work orders logged yet.</p>}
          {validWorkOrders.map((wo) => {
            const wf = wo.fields;
            return (
              <div className="woEntry" key={wo.id}>
                <div><b>{wf[WORK_ORDER_FIELDS.woId]}</b> — {formatDate(wf[WORK_ORDER_FIELDS.date])} — {wf[WORK_ORDER_FIELDS.status]}</div>
                <div>{wf[WORK_ORDER_FIELDS.notes]}</div>
                {wf[WORK_ORDER_FIELDS.laborHours] ? <div>Labor: {wf[WORK_ORDER_FIELDS.laborHours]} hrs</div> : null}
              </div>
            );
          })}
        </div>

        <div className="section" style={{ marginTop: 40, borderTop: "1px solid #ccc", paddingTop: 8, fontSize: 11, color: "#888" }}>
          Printed {new Date().toLocaleDateString("en-US")}
        </div>
      </div>
    </>
  );
}
