import { NextResponse } from "next/server";
import {
  listRecords,
  createRecord,
  TABLES,
  WORK_ORDER_FIELDS,
} from "../../../lib/airtable";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const flaggedOnly = searchParams.get("flagged") === "1";
  const excludeStatus = searchParams.get("excludeStatus");

  const clauses = [];
  if (flaggedOnly) clauses.push("{Flagged by Boss} = 1");
  if (excludeStatus) clauses.push(`{Status} != "${excludeStatus}"`);

  let filterByFormula;
  if (clauses.length === 1) filterByFormula = clauses[0];
  if (clauses.length > 1) filterByFormula = `AND(${clauses.join(",")})`;

  try {
    const records = await listRecords(TABLES.workOrders, {
      filterByFormula,
    });
    records.sort((a, b) => {
      const da = a.fields[WORK_ORDER_FIELDS.date] || "";
      const db = b.fields[WORK_ORDER_FIELDS.date] || "";
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
    const record = await createRecord(TABLES.workOrders, fields);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
