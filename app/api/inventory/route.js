import { NextResponse } from "next/server";
import {
  listRecords,
  createRecord,
  getRecord,
  TABLES,
  INVENTORY_FIELDS,
  CONSIGNOR_FIELDS,
  CUSTOMER_FIELDS,
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

function initials(name, len = 3) {
  const letters = (name || "").replace(/[^A-Za-z]/g, "").toUpperCase();
  return letters.slice(0, len) || "CCG";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sourceType,
      consignorId,
      customerId,
      title,
      dateReceived,
      description,
      purchasedFrom,
    } = body;

    // Work out the SKU prefix for this source type.
    let prefix = "CCG";
    if (sourceType === "Consignment" && consignorId) {
      const consignor = await getRecord(TABLES.consignors, consignorId);
      prefix =
        consignor.fields[CONSIGNOR_FIELDS.code] ||
        initials(consignor.fields[CONSIGNOR_FIELDS.name]);
    } else if (sourceType === "Customer Repair" && customerId) {
      const customer = await getRecord(TABLES.customers, customerId);
      prefix = initials(customer.fields[CUSTOMER_FIELDS.name]);
    } else {
      prefix = "CCG";
    }

    // Auto-number: next label # for this prefix.
    const existing = await listRecords(TABLES.inventory, {
      filterByFormula: `{SKU Prefix} = "${prefix}"`,
    });
    const nextLabel = existing.length + 1;

    const fields = {
      [INVENTORY_FIELDS.title]: title,
      [INVENTORY_FIELDS.dateReceived]: dateReceived,
      [INVENTORY_FIELDS.description]: description || "",
      [INVENTORY_FIELDS.status]: "Just Received",
      [INVENTORY_FIELDS.sourceType]: sourceType,
      [INVENTORY_FIELDS.skuPrefix]: prefix,
      [INVENTORY_FIELDS.labelNumber]: nextLabel,
    };
    if (sourceType === "Consignment" && consignorId) {
      fields[INVENTORY_FIELDS.consignor] = [consignorId];
    }
    if (sourceType === "Customer Repair" && customerId) {
      fields[INVENTORY_FIELDS.customer] = [customerId];
    }
    if (sourceType === "In-House Purchase" && purchasedFrom) {
      fields[INVENTORY_FIELDS.purchasedFrom] = purchasedFrom;
    }

    const record = await createRecord(TABLES.inventory, fields);
    return NextResponse.json({ record, prefix, labelNumber: nextLabel });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
