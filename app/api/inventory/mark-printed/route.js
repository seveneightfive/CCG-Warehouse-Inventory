import { NextResponse } from "next/server";
import { updateRecordsBatch, TABLES, INVENTORY_FIELDS } from "../../../../lib/airtable";

export async function POST(request) {
  try {
    const { recordIds } = await request.json();
    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return NextResponse.json({ error: "No records given" }, { status: 400 });
    }
    const records = recordIds.map((id) => ({
      id,
      fields: { [INVENTORY_FIELDS.labelPrinted]: true },
    }));
    const result = await updateRecordsBatch(TABLES.inventory, records);
    return NextResponse.json({ records: result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
