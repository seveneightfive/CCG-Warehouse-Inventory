import { NextResponse } from "next/server";
import {
  getRecord,
  updateRecord,
  logTransaction,
  TABLES,
  WORK_ORDER_FIELDS,
} from "../../../../lib/airtable";

export async function GET(request, { params }) {
  try {
    const record = await getRecord(TABLES.workOrders, params.id);
    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const fields = await request.json();

    let before = null;
    if (WORK_ORDER_FIELDS.partsUsed in fields) {
      before = await getRecord(TABLES.workOrders, params.id);
    }

    const record = await updateRecord(TABLES.workOrders, params.id, fields);

    if (before) {
      const oldPartIds = before.fields[WORK_ORDER_FIELDS.partsUsed] || [];
      const newPartIds = fields[WORK_ORDER_FIELDS.partsUsed] || [];
      const staffIds =
        fields[WORK_ORDER_FIELDS.staff] || before.fields[WORK_ORDER_FIELDS.staff] || [];

      const added = newPartIds.filter((id) => !oldPartIds.includes(id));
      const removed = oldPartIds.filter((id) => !newPartIds.includes(id));

      for (const partId of added) {
        try {
          await logTransaction({
            type: "Checked Out",
            partId,
            quantityChange: -1,
            workOrderId: params.id,
            staffId: staffIds[0],
            notes: "Checked out on work order update",
          });
        } catch (logErr) {
          console.error("Failed to log inventory transaction:", logErr);
        }
      }

      for (const partId of removed) {
        try {
          await logTransaction({
            type: "Returned",
            partId,
            quantityChange: 1,
            workOrderId: params.id,
            staffId: staffIds[0],
            notes: "Removed from work order",
          });
        } catch (logErr) {
          console.error("Failed to log inventory transaction:", logErr);
        }
      }
    }

    return NextResponse.json({ record });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}