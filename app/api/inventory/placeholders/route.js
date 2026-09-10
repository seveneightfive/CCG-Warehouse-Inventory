import { NextResponse } from "next/server";
import {
  listRecords,
  createRecordsBatch,
  TABLES,
  INVENTORY_FIELDS,
} from "../../../../lib/airtable";

export async function POST(request) {
  try {
    const { prefix, consignorId, count } = await request.json();
    if (!prefix) {
      return NextResponse.json({ error: "Missing prefix" }, { status: 400 });
    }
    const batchSize = Math.min(Math.max(Number(count) || 30, 1), 30);

    const existing = await listRecords(TABLES.inventory, {
      filterByFormula: `{SKU Prefix} = "${prefix}"`,
    });
    const startLabel = existing.length + 1;

    let sourceType = "In-House Purchase";
    if (consignorId) sourceType = "Consignment";

    const records = [];
    for (let i = 0; i < batchSize; i++) {
      const fields = {
        [INVENTORY_FIELDS.skuPrefix]: prefix,
        [INVENTORY_FIELDS.labelNumber]: startLabel + i,
        [INVENTORY_FIELDS.status]: "Just Received",
        [INVENTORY_FIELDS.sourceType]: sourceType,
        [INVENTORY_FIELDS.placeholder]: true,
        [INVENTORY_FIELDS.title]: "",
      };
      if (consignorId) fields[INVENTORY_FIELDS.consignor] = [consignorId];
      records.push(fields);
    }

    const created = await createRecordsBatch(TABLES.inventory, records);
    return NextResponse.json({ records: created });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
