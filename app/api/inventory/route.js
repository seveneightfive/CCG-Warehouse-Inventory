import { NextResponse } from "next/server";
import {
  listRecords,
  createRecord,
  TABLES,
  INVENTORY_FIELDS,
} from "../../../lib/airtable";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const excludeStatus = searchParams.get("excludeStatus");

  let filterByFormula;
  if (status) {
    filterByFormula = `{Status} = "${status}"`;
  } else if (excludeStatus) {
    filterByFormula = `{Status} != "${excludeStatus}"`;
  }

  try {
    const records = await listRecords(TABLES.inventory, { filterByFormula });
    records.sort((a, b) => {
      const da = a.fields[INVENTORY_FIELDS.dateReceived] || "";
      const db = b.fields[INVENTORY_FIELDS.dateReceived] || "";
      return db.localeCompare(da);
    });
    return NextResponse.json({ records });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const fields = await request.json();
    const record = await createRecord(TABLES.inventory, fields);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
