import { NextResponse } from "next/server";
import { createRecord, logTransaction, PART_FIELDS, TABLES } from "../../../lib/airtable";

export async function POST(request) {
  try {
    const fields = await request.json();
    const record = await createRecord(TABLES.parts, fields);

    const quantity = fields[PART_FIELDS.purchasedAmount];
    try {
      await logTransaction({
        type: "Received",
        partId: record.id,
        quantityChange: quantity ?? null,
        notes: `New part added: ${fields[PART_FIELDS.name] || "(unnamed)"}`,
      });
    } catch (logErr) {
      console.error("Failed to log inventory transaction:", logErr);
    }

    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}