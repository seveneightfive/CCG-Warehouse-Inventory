import { NextResponse } from "next/server";
import {
  listRecords,
  TABLES,
  CONSIGNOR_FIELDS,
  STAFF_FIELDS,
  LOCATION_FIELDS,
  PART_FIELDS,
} from "../../../lib/airtable";

export async function GET() {
  try {
    const [consignors, staff, locations, parts] = await Promise.all([
      listRecords(TABLES.consignors),
      listRecords(TABLES.staff),
      listRecords(TABLES.locations),
      listRecords(TABLES.parts),
    ]);

    const simplify = (records, fieldId) =>
      records
        .map((r) => ({ id: r.id, name: r.fields[fieldId] || "(untitled)" }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      consignors: simplify(consignors, CONSIGNOR_FIELDS.name),
      staff: simplify(staff, STAFF_FIELDS.name),
      locations: simplify(locations, LOCATION_FIELDS.name),
      parts: simplify(parts, PART_FIELDS.name),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
