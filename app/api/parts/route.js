import { NextResponse } from "next/server";
import { createRecord, TABLES } from "../../../lib/airtable";

export async function POST(request) {
  try {
    const fields = await request.json();
    const record = await createRecord(TABLES.parts, fields);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
