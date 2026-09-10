import { NextResponse } from "next/server";
import { getRecord, updateRecord, TABLES } from "../../../../lib/airtable";

export async function GET(request, { params }) {
  try {
    const record = await getRecord(TABLES.inventory, params.id);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const fields = await request.json();
    const record = await updateRecord(TABLES.inventory, params.id, fields);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
